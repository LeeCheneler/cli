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
    .use(async (ctx, next) => {
      console.log("1");
    })
    .use(async (ctx, next) => {
      console.log("2");
    })
    .use(async (ctx, next) => {
      console.log("3");
    })
    .run([]);

  expect(result.code).toBe(0);
  expect(consoleLogMock).toHaveBeenCalledWith("1");
  expect(consoleLogMock).not.toHaveBeenCalledWith("2");
  expect(consoleLogMock).not.toHaveBeenCalledWith("3");
});
