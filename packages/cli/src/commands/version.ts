import { Context, NextFunction } from "../types";

export const version = (versionString: string) => async (
  ctx: Context,
  next: NextFunction
) => {
  console.log(versionString);
  await next();
};
