import { createCli } from "../main";

const consoleLogMock = jest.fn();
console.log = consoleLogMock;

afterEach(() => {
  consoleLogMock.mockReset();
});

it("should execute middlware in order", async () => {
  const result = await createCli()
    .use(async (ctx, next) => {
      console.log("1");
      await next();
    })
    .use(async (ctx, next) => {
      console.log("2");
      await next();
    })
    .use(async (ctx, next) => {
      console.log("3");
      await next();
    })
    .run([]);

  expect(result.code).toBe(0);
  expect(consoleLogMock.mock.calls[0][0]).toBe("1");
  expect(consoleLogMock.mock.calls[1][0]).toBe("2");
  expect(consoleLogMock.mock.calls[2][0]).toBe("3");
});

it("should execute next middlware only if next() is called", async () => {
  const result = await createCli()
    .use(async () => {
      console.log("1");
    })
    .use(async () => {
      console.log("2");
    })
    .use(async () => {
      console.log("3");
    })
    .run([]);

  expect(result.code).toBe(0);
  expect(consoleLogMock).toHaveBeenCalledWith("1");
  expect(consoleLogMock).not.toHaveBeenCalledWith("2");
  expect(consoleLogMock).not.toHaveBeenCalledWith("3");
});

it("should throw error if next() is called multiple times", async () => {
  const error = new Error();
  expect(() =>
    createCli()
      .use(async (ctx, next) => {
        await next();
        await next();
      })
      .run([])
  ).rejects.toThrowError("next() called multiple times");
});
