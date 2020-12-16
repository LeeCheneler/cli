import minimist from "minimist";

export interface CliResult {
  code: number;
}

export interface Cli {
  use: (middlware: MiddlwareFunction) => Cli;
  useCommand: (name: string, middleware: MiddlwareFunction) => Cli;
  run: (args: string[]) => Promise<CliResult>;
}

export const createCli = (): Cli => {
  const middlewares: MiddlwareFunction[] = [errorHandler];
  const context: Context = {
    args: [],
    parsedArgs: {},
    code: 0,
    throw: (code: number, message: string) => {
      throw new CliError(code, message);
    },
    assert: (passed: boolean, message: string) => {
      if (!passed) {
        context.throw(1, message);
      }
    },
    assertType: (
      name: string,
      value: any,
      expectedType: "boolean" | "number" | "string"
    ) => {
      context.assert(
        typeof value === expectedType,
        `Argument "${name}" must be a ${expectedType}.`
      );
    },
    assertRequired: (name: string, value: any) => {
      context.assert(value !== undefined, `Argument "${name}" is required,`);
    },
  };

  const cli: Cli = {
    use: (middleware) => {
      middlewares.push(middleware);
      return cli;
    },
    useCommand: (name, middleware) => {
      const commandMiddleware: MiddlwareFunction = async (
        ctx: Context,
        next: NextFunction
      ) => {
        const [command] = ctx.args;
        if (command === name) {
          await middleware(ctx, next);
        } else {
          await next();
        }
      };

      middlewares.push(commandMiddleware);

      return cli;
    },
    run: async (args: string[]) => {
      context.args = args;
      context.parsedArgs = minimist(args);

      await composeMiddleware(middlewares)(context, async () => {});
      return { code: context.code };
    },
  };

  return cli;
};

class CliError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

export interface Context<TParsedArgs = {}> {
  args: string[];
  code: number;
  parsedArgs: TParsedArgs;
  throw: (code: number, message: string) => void;
  assert: (passed: boolean, message: string) => void;
  assertType: (
    name: string,
    value: any,
    expectedType: "boolean" | "number" | "string"
  ) => void;
  assertRequired: (name: string, value: any) => void;
}

export type NextFunction = () => Promise<void>;

const errorHandler: MiddlwareFunction = async (
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

export type MiddlwareFunction = (ctx: any, next: NextFunction) => Promise<void>;

// implementation taken from koa-compose https://github.com/koajs/compose
const composeMiddleware = (middlewares: MiddlwareFunction[]) => {
  if (!Array.isArray(middlewares)) {
    throw new TypeError("Middleware stack must be an array!");
  }

  for (const fn of middlewares) {
    if (typeof fn !== "function") {
      throw new TypeError("Middleware must be composed of functions!");
    }
  }

  return function (context: Context, next: NextFunction) {
    let lastCalledMiddlewareIndex = -1;

    const dispatch = async (middlewareIndex: number): Promise<void> => {
      if (middlewareIndex <= lastCalledMiddlewareIndex) {
        return Promise.reject(new Error("next() called multiple times"));
      }

      lastCalledMiddlewareIndex = middlewareIndex;

      let middlewareFunc = middlewares[middlewareIndex];

      if (middlewareIndex === middlewares.length) middlewareFunc = next;

      if (!middlewareFunc) {
        return Promise.resolve();
      }

      try {
        await middlewareFunc(context, dispatch.bind(null, middlewareIndex + 1));
      } catch (err) {
        return Promise.reject(err);
      }
    };

    return dispatch(0);
  };
};
