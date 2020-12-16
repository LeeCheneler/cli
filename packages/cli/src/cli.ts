import minimist from "minimist";
import { Context, NextFunction, MiddlwareFunction } from "./types";
import { CliError } from "./errors";
import { errorHandler } from "./middleware/error-handler";
import { version } from "./commands/version";
import { help } from "./commands/help";
import { composeMiddleware } from "./compose-middleware";

export interface Cli {
  use: (middlware: MiddlwareFunction) => Cli;
  useCommand: (
    name: string,
    description: string,
    middleware: MiddlwareFunction
  ) => Cli;
  run: (args: string[]) => Promise<{ code: number }>;
}

export interface CreateCliOptions {
  version: string;
  name: string;
  description: string;
}

export const createCli = (options: CreateCliOptions): Cli => {
  const middlewares: MiddlwareFunction[] = [];
  const context: Context = {
    args: [],
    parsedArgs: { _: [] },
    code: 0,
    commands: [],
    throw: (code: number, message: string) => {
      throw new CliError(code, message);
    },
    assert: (passed: boolean, message: string) => {
      if (!passed) {
        context.throw(1, message);
      }
    },
    assertType: (
      name: string,
      value: any,
      expectedType: "boolean" | "number" | "string"
    ) => {
      context.assert(
        typeof value === expectedType,
        `Argument "${name}" must be a ${expectedType}.`
      );
    },
    assertRequired: (name: string, value: any) => {
      context.assert(value !== undefined, `Argument "${name}" is required.`);
    },
  };

  const cli: Cli = {
    use: (middleware) => {
      middlewares.push(middleware);
      return cli;
    },
    useCommand: (name, description, middleware) => {
      context.commands.push({
        name,
        description,
      });

      const commandMiddleware: MiddlwareFunction = async (
        ctx: Context,
        next: NextFunction
      ) => {
        if (ctx.parsedArgs._.length === 0) {
          ctx.throw(1, "Please provide a command.");
        }

        const [command] = ctx.parsedArgs._;

        if (command === name) {
          await middleware(ctx, next);
        } else {
          await next();
        }
      };

      middlewares.push(commandMiddleware);

      return cli;
    },
    run: async (args: string[]) => {
      context.args = args;
      context.parsedArgs = minimist(args);

      // register default commands
      cli.useCommand("version", "Display version.", version(options.version));
      cli.useCommand(
        "help",
        "Display help.",
        help({ name: options.name, description: options.description })
      );

      await composeMiddleware(middlewares)(context);
      return { code: context.code };
    },
  };

  // important errorHandler is always applied first
  cli.use(errorHandler);

  return cli;
};
