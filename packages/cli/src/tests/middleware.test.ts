import { EXAMPE_CLI_OPTIONS } from "../test-utils/cli-options";
import { mockConsole } from "../test-utils/console";
import { createCli } from "../main";

const consoleMock = mockConsole();

afterEach(() => {
  consoleMock.reset();
});

it("should execute middlware in order", async () => {
  const result = await createCli(EXAMPE_CLI_OPTIONS)
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
    .run(["version"]);

  expect(result.code).toBe(0);
  expect(consoleMock.log.mock.calls[0][0]).toBe("1");
  expect(consoleMock.log.mock.calls[1][0]).toBe("2");
  expect(consoleMock.log.mock.calls[2][0]).toBe("3");
});

it("should execute next middlware only if next() is called", async () => {
  const result = await createCli(EXAMPE_CLI_OPTIONS)
    .use(async () => {
      console.log("1");
    })
    .use(async () => {
      console.log("2");
    })
    .use(async () => {
      console.log("3");
    })
    .run(["version"]);

  expect(result.code).toBe(0);
  expect(consoleMock.log).toHaveBeenCalledWith("1");
  expect(consoleMock.log).not.toHaveBeenCalledWith("2");
  expect(consoleMock.log).not.toHaveBeenCalledWith("3");
});

it("should throw error if next() is called multiple times", async () => {
  await expect(() =>
    createCli(EXAMPE_CLI_OPTIONS)
      .use(async (ctx, next) => {
        await next();
        await next();
      })
      .run(["version"])
  ).rejects.toThrowError("next() called multiple times");
});
