import { Context, NextFunction } from "../types";

const getMaxLength = (list: string[]) => {
  return list.reduce((acc, next) => Math.max(acc, next.length), 0);
};

interface HelpOptions {
  name: string;
  description: string;
}

export const help = (options: HelpOptions) => async (
  ctx: Context,
  next: NextFunction
) => {
  const [commandName] = ctx.rawOptions;
  if (commandName) {
    const command = ctx.commands.find((c) => c.name === commandName);

    if (command === undefined) {
      ctx.throw(
        1,

        `Command "${commandName}" not recognised.

Run "${options.name} help" to see a list of commands.`
      );
    }

    // description
    const description = `${command!.description}\n\n`;

    // usage
    const positionalExample = command!.positionals?.length
      ? ` ${command!.positionals
          .map((p) => `[${p.name}${p.array ? "..." : ""}]`)
          .join(" ")}`
      : "";
    const usage = `Usage:\n\n${options.name} ${
      command!.name
    }${positionalExample}\n\n`;

    // option widths
    const positionalsMaxNameWidth = getMaxLength(
      command!.positionals?.map((p) => p.name) ?? []
    );
    const positionalsMaxDescriptionWidth = getMaxLength(
      command!.positionals?.map((p) => p.description) ?? []
    );

    const argumentsMaxNameWidth = getMaxLength(
      command!.arguments?.map((p) => p.name) ?? []
    );
    const argumentsMaxDescriptionWidth = getMaxLength(
      command!.arguments?.map((p) => p.description) ?? []
    );

    // Add 2 for option decorations "--" and "[]"
    const optionNameWidth =
      Math.max(positionalsMaxNameWidth, argumentsMaxNameWidth) + 2;
    const optionDescriptionWidth = Math.max(
      positionalsMaxDescriptionWidth,
      argumentsMaxDescriptionWidth
    );

    // positionals
    const positionalsList =
      command?.positionals
        ?.map((p) => {
          const name = `[${p.name}]`.padEnd(optionNameWidth, " ");
          const description = p.description.padEnd(optionDescriptionWidth, " ");
          const type = `${p.type}${p.array ? "[]" : ""}`;
          const required = p.required ? ", required" : "";
          return `${name} - ${description} (${type}${required})`;
        })
        .join("\n") ?? "";

    // arguments
    const argumentsList =
      command?.arguments
        ?.map((a) => {
          const name = `--${a.name}`.padEnd(optionNameWidth, " ");
          const description = a.description.padEnd(optionDescriptionWidth, " ");
          const type = a.type;
          const required = a.required ? ", required" : "";
          return `${name} - ${description} (${type}${required})`;
        })
        .join("\n") ?? "";

    // options
    const hasArguments = !!command?.arguments?.length;
    const hasPositionals = !!command?.positionals?.length;
    const optionsList =
      hasArguments || hasPositionals
        ? `Options:\n\n${positionalsList}${
            hasArguments && hasPositionals ? "\n" : ""
          }${argumentsList}\n\n`
        : "";

    // final output
    const output = `${description}${usage}${optionsList}`.trimEnd();
    console.log(output);
  } else {
    // decription
    const description = `${options.description}\n\n`;

    // usage
    const usage = `Usage:\n\n${options.name} [command] ...\n\n`;

    // commands
    const commandNameWidth = getMaxLength(ctx.commands.map((c) => c.name));
    const commandList = ctx.commands
      .map((c) => `${c.name.padEnd(commandNameWidth, " ")} - ${c.description}`)
      .join("\n");
    const commands = `Commands:\n\n${commandList}\n\n`;

    // comand usage
    const commandUsage = `Run "${options.name} help [command]" for command usage.`;

    // final output
    const output = `${description}${usage}${commands}${commandUsage}`;
    console.log(output);
  }

  await next();
};
