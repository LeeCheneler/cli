import { createCli, Context, NextFunction } from "@leecheneler/cli";
import pkg from "../package.json";

async function version(ctx: Context, next: NextFunction) {
  console.log(pkg.version);
  await next();
}

export const bootstrap = () => {
  return createCli()
    .use(async (ctx: Context, next: NextFunction) => {
      console.log("hello world!");
      await next();
    })
    .useCommand("version", version);
};
