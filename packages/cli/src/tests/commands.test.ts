import { EXAMPE_CLI_OPTIONS } from "../test-utils/cli-options";
import { mockConsole } from "../test-utils/console";
import { createCli } from "../main";

const consoleMock = mockConsole();

afterEach(() => {
  consoleMock.reset();
});

it("should exit with 1 and present help if no command is provided", async () => {
  const result = await createCli(EXAMPE_CLI_OPTIONS)
    .useCommand("test", "A test command.", async () => {})
    .run(["--not-a-command"]);

  expect(result.code).toBe(1);
  expect(consoleMock.error).toHaveBeenCalledWith("Please provide a command.");
});

it("should only execute correct command", async () => {
  const result = await createCli(EXAMPE_CLI_OPTIONS)
    .useCommand("hello", "Say hello.", async (ctx, next) => {
      console.log("hello world");
      await next();
    })
    .useCommand("goodbye", "Say goodbye.", async (ctx, next) => {
      console.log("goodbye world");
      await next();
    })
    .run(["hello"]);

  expect(result.code).toBe(0);
  expect(consoleMock.log).toHaveBeenCalledWith("hello world");
  expect(consoleMock.log).not.toHaveBeenCalledWith("goodbye world");
});
