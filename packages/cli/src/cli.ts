import minimist from "minimist";
import {
  Argument,
  Context,
  NextFunction,
  MiddlwareFunction,
  Positional,
} from "./types";
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
      positionals?: Positional[];
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

export const createCli = (createCliOptions: CreateCliOptions): Cli => {
  const middlewares: MiddlwareFunction[] = [];
  const context: Context = {
    rawOptions: [],
    options: { _: [] },
    code: 0,
    commands: [],
    commandName: "unknown",
    throw: (code: number, message: string) => {
      throw new CliError(code, message);
    },
  };
  const assert = (passed: boolean, message: string) => {
    if (!passed) {
      context.throw(1, message);
    }
  };

  const cli: Cli = {
    use: (middleware) => {
      middlewares.push(middleware);
      return cli;
    },
    useCommand: (name, description, middleware, options) => {
      // Ensure only the last positional is an array
      if (options?.positionals && options.positionals.length > 1) {
        const precedingPositionals = options.positionals.slice(
          0,
          options.positionals.length - 1
        );

        for (let p of precedingPositionals) {
          if (p.array) {
            throw new Error(
              `Positional "${p.name}" can not be an array. Only the last positional can be an array.`
            );
          }
        }
      }

      context.commands.push({
        name,
        description,
        arguments: options?.arguments,
        positionals: options?.positionals,
      });

      const commandMiddleware: MiddlwareFunction = async (
        ctx: Context,
        next: NextFunction
      ) => {
        if (context.commandName === name) {
          const helpCommandSuggestion = `Run "${createCliOptions.name} help ${name}" to see help for this command.`;

          // assert required arguments
          const requiredArguments =
            options?.arguments?.filter((a) => a.required) ?? [];
          for (let a of requiredArguments) {
            assert(
              context.options[a.name] !== undefined,
              `Option --${a.name} is required.

${helpCommandSuggestion}`
            );
          }

          // assert required positionals
          const requiredPositionals =
            options?.positionals
              ?.filter((p) => p.required)
              .map((p, i) => ({ name: p.name, index: i })) ?? [];
          for (let p of requiredPositionals) {
            assert(
              context.options._[p.index] !== undefined,
              `Option [${p.name}] is required.

${helpCommandSuggestion}`
            );
          }

          // assert argument types
          const providedArguments =
            options?.arguments?.filter(
              (a) => context.options[a.name] !== undefined
            ) ?? [];
          for (let a of providedArguments) {
            assert(
              typeof context.options[a.name] === a.type,
              `Option --${a.name} must be of type ${a.type}.

${helpCommandSuggestion}`
            );
          }

          // assert positional types
          const providedPositionals =
            options?.positionals
              ?.filter((p, i) => context.options._[i] !== undefined)
              .map((p, i) => ({ name: p.name, index: i, type: p.type })) ?? [];
          for (let p of providedPositionals) {
            assert(
              typeof context.options._[p.index] === p.type,
              `Option [${p.name}] must be of type ${p.type}.

${helpCommandSuggestion}`
            );
          }

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
      cli.useCommand(
        "version",
        "Display version.",
        version(createCliOptions.version)
      );
      cli.useCommand(
        "help",
        "Display help.",
        help({
          name: createCliOptions.name,
          description: createCliOptions.description,
        }),
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
      const command = context.commands.find(
        (c) => c.name === context.commandName
      );
      if (!command) {
        console.error(
          `Command "${context.commandName}" not recognised.

Run "${createCliOptions.name} help" to see a list of commands.`
        );
        return { code: 1 };
      }

      // parse args and run
      const [, ...remainingArgs] = args;

      context.rawOptions = remainingArgs;
      context.options = minimist(remainingArgs, {
        boolean:
          command.arguments
            ?.filter((a) => a.type === "boolean")
            .map((a) => a.name) ?? [],
        string:
          command.arguments
            ?.filter((a) => a.type === "string")
            .map((a) => a.name) ?? [],
      });

      await composeMiddleware(middlewares)(context);
      return { code: context.code };
    },
  };

  // important errorHandler is always applied first
  cli.use(errorHandler);

  return cli;
};
