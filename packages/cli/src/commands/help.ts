import { Context, NextFunction } from "../types";

interface HelpOptions {
  name: string;
  description: string;
}

export const help = (options: HelpOptions) => async (
  ctx: Context,
  next: NextFunction
) => {
  const commandNameWidth = ctx.commands.reduce(
    (acc, next) => Math.max(acc, next.name.length),
    0
  );

  const description = `${options.description}\n\n`;
  const usage = `Usage:\n\n${options.name} [command] [...options]\n\n`;
  const commands = `Commands:\n\n${ctx.commands
    .map((c) => `${c.name.padEnd(commandNameWidth, " ")} - ${c.description}`)
    .join("\n")}`;

  const output = `${description}${usage}${commands}`;
  console.log(output);

  await next();
};
