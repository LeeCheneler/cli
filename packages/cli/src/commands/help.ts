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
  const [commandName] = ctx.args;
  if (commandName) {
    const command = ctx.commands.find((c) => c.name === commandName);

    if (command === undefined) {
      ctx.throw(
        1,
        `Command "${commandName}" not recognised. Run "${options.name} help" to see a list of commands.`
      );
    }

    // description
    const description = `${command!.description}\n\n`;

    // usage
    const positionalExample = command!.positionals?.length
      ? " [positionals]"
      : "";
    const argumentsExample = command!.arguments?.length ? " [--arguments]" : "";
    const usage = `Usage:\n\n${options.name} ${
      command!.name
    }${positionalExample}${argumentsExample}\n\n`;

    // positionals
    const positionalsNameWidth = getMaxLength(
      command!.positionals?.map((p) => p.name) ?? []
    );
    const positionalsDescriptionWidth = getMaxLength(
      command!.positionals?.map((p) => p.description) ?? []
    );
    const positionalsList = command!.positionals
      ?.map((p) => {
        const name = p.name.padEnd(positionalsNameWidth, " ");
        const description = p.description.padEnd(
          positionalsDescriptionWidth,
          " "
        );
        const type = p.type;
        const required = p.required ? ", required" : "";
        return `${name} - ${description} (${type}${required})`;
      })
      .join("\n");

    const positionals = command!.positionals?.length
      ? `Positionals:\n\n${positionalsList}\n\n`
      : "";

    // arguments
    const argumentsNameWidth = getMaxLength(
      command!.arguments?.map((p) => p.name) ?? []
    );
    const argumentsDescriptionWidth = getMaxLength(
      command!.arguments?.map((p) => p.description) ?? []
    );

    const argumentsList = command!.arguments
      ?.map((a) => {
        const name = a.name.padEnd(argumentsNameWidth, " ");
        const description = a.description.padEnd(
          argumentsDescriptionWidth,
          " "
        );
        const type = a.type;
        const required = a.required ? ", required" : "";
        return `${name} - ${description} (${type}${required})`;
      })
      .join("\n");

    const args = command!.arguments?.length
      ? `Arguments:\n\n${argumentsList}\n\n`
      : "";

    // final output
    const output = `${description}${usage}${positionals}${args}`.trimEnd();
    console.log(output);
  } else {
    // decription
    const description = `${options.description}\n\n`;

    // usage
    const usage = `Usage:\n\n${options.name} [command] [positionals] [--arguments]\n\n`;

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
