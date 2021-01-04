import { createCli, Context, NextFunction } from "@leecheneler/cli";
import pkg from "../package.json";

export const bootstrap = () => {
  interface HelloArgs {
    name: string;
  }

  const hello = async (ctx: Context<HelloArgs>, next: NextFunction) => {
    console.log(`Hello ${ctx.options.name}!`);

    await next();
  };

  const cli = createCli({
    name: "example",
    description: "Example CLI.",
    version: pkg.version,
  });

  cli.useCommand("hello", "Say hello.", hello, {
    arguments: [
      {
        name: "name",
        description: "Name to say hello to.",
        type: "string",
        required: true,
      },
    ],
    positionals: [
      {
        name: "other",
        description: "Other name to say hello to.",
        type: "string",
        required: true,
      },
    ],
  });

  return cli;
};
