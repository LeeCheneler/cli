import { createCli, Context, NextFunction } from "@leecheneler/cli";
import pkg from "../package.json";

const helloWorld = async (ctx: Context, next: NextFunction) => {
  console.log("hello world!");
  await next();
};

const version = async (ctx: Context, next: NextFunction) => {
  console.log(pkg.version);
  await next();
};

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
  return createCli()
    .use(helloWorld)
    .useCommand("throw-example", throwExample)
    .useCommand("version", version);
};
