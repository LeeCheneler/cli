import { createCli, Context, NextFunction } from "@leecheneler/cli";
import pkg from "../package.json";

const example = async (ctx: Context, next: NextFunction) => {
  console.log("hello world!");
  await next();
};

export const bootstrap = () => {
  return createCli({
    version: pkg.version,
    description: "An example CLI tool.",
    name: "cli",
  }).useCommand("example", "Example command.", example, {
    positionals: [
      {
        name: "first",
        description: "First positional.",
        type: "string",
        required: true,
      },
      {
        name: "second",
        description: "Second positional.",
        type: "number",
        required: true,
      },
    ],
    arguments: [
      {
        name: "fourth",
        description: "Fourth argument.",
        type: "string",
        required: true,
      },
      {
        name: "fifth",
        description: "Fifth argument.",
        type: "number",
        required: true,
      },
      {
        name: "sixth",
        description: "Sixth argument.",
        type: "boolean",
        required: false,
      },
    ],
  });
};
