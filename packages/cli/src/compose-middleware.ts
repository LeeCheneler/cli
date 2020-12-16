import { Context, NextFunction, MiddlwareFunction } from "./types";

// implementation taken from koa-compose https://github.com/koajs/compose
export const composeMiddleware = (middlewares: MiddlwareFunction[]) => {
  return function (context: Context, next?: NextFunction) {
    let lastCalledMiddlewareIndex = -1;

    const dispatch = async (middlewareIndex: number): Promise<void> => {
      if (middlewareIndex <= lastCalledMiddlewareIndex) {
        return Promise.reject(new Error("next() called multiple times"));
      }

      lastCalledMiddlewareIndex = middlewareIndex;

      let middlewareFunc: MiddlwareFunction | undefined =
        middlewares[middlewareIndex];

      if (middlewareIndex === middlewares.length) {
        middlewareFunc = next;
      }

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
