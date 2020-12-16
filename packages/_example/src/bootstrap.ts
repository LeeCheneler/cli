import { createCli, Context, NextFunction } from "@leecheneler/cli";
import pkg from "../package.json";

const throwExample = async (
  ctx: Context<{ code: number }>,
  next: NextFunction
) => {
  ctx.assertRequired("code", ctx.parsedArgs.code);
  ctx.assertType("code", ctx.parsedArgs.code, "number");
  ctx.throw(
    ctx.parsedArgs.code,
    `Program exiting with code ${ctx.parsedArgs.code}.`
  );
  await next();
};

export const bootstrap = () => {
  return createCli({
    version: pkg.version,
    description: "An example CLI tool.",
    name: "example",
  }).useCommand("throw-example", "Throw an error on purpose.", throwExample);
};
