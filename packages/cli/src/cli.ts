import minimist from "minimist";
import { Argument, Context, NextFunction, MiddlwareFunction } from "./types";
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
    middleware: MiddlwareFunction,
    options?: {
      positionals?: Argument[];
      arguments?: Argument[];
    }
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
    commandName: "unknown",
    throw: (code: number, message: string) => {
      throw new CliError(code, message);
    },
    // assert: (passed: boolean, message: string) => {
    //   if (!passed) {
    //     context.throw(1, message);
    //   }
    // },
    // assertType: (
    //   name: string,
    //   value: any,
    //   expectedType: "boolean" | "number" | "string"
    // ) => {
    //   context.assert(
    //     typeof value === expectedType,
    //     `Argument "${name}" must be a ${expectedType}.`
    //   );
    // },
    // assertRequired: (name: string, value: any) => {
    //   context.assert(value !== undefined, `Argument "${name}" is required.`);
    // },
  };

  const cli: Cli = {
    use: (middleware) => {
      middlewares.push(middleware);
      return cli;
    },
    useCommand: (name, description, middleware, options) => {
      context.commands.push({
        name,
        description,
        arguments: options?.arguments ?? [],
        positionals: options?.positionals ?? [],
      });

      const commandMiddleware: MiddlwareFunction = async (
        ctx: Context,
        next: NextFunction
      ) => {
        if (context.commandName === name) {
          await middleware(ctx, next);
        } else {
          await next();
        }
      };

      middlewares.push(commandMiddleware);

      return cli;
    },
    run: async (args: string[]) => {
      // register default commands
      cli.useCommand("version", "Display version.", version(options.version));
      cli.useCommand(
        "help",
        "Display help.",
        help({ name: options.name, description: options.description }),
        {
          positionals: [
            {
              name: "command",
              description: "Command to display help for.",
              type: "string",
            },
          ],
        }
      );

      // ensure a known command is provided
      if (args.length === 0) {
        console.error("Please provide a command.");
        return { code: 1 };
      }

      context.commandName = args[0];
      if (!context.commands.find((c) => c.name === context.commandName)) {
        console.error(
          `Command "${context.commandName}" not recognised. Run "${options.name} help" to see a list of commands.`
        );
        return { code: 1 };
      }

      // parse args and run
      const [, ...remainingArgs] = args;

      context.args = remainingArgs;
      context.parsedArgs = minimist(remainingArgs);

      await composeMiddleware(middlewares)(context);
      return { code: context.code };
    },
  };

  // important errorHandler is always applied first
  cli.use(errorHandler);

  return cli;
};
