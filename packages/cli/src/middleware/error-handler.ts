import { Context, NextFunction, MiddlwareFunction } from "../types";
import { CliError } from "../errors";

export const errorHandler: MiddlwareFunction = async (
  ctx: Context,
  next: NextFunction
) => {
  try {
    await next();
  } catch (e) {
    // throw if its not an error thrown by ctx.throw(...)
    if (!(e instanceof CliError)) {
      throw e;
    }

    // if its a CliError then print out message and update context code
    ctx.code = e.code;
    console.error((e as CliError).message);
  }
};
