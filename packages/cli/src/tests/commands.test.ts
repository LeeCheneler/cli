import { Context, createCli } from "../main";

const consoleErrorMock = jest.fn();
console.error = consoleErrorMock;

const consoleLogMock = jest.fn();
console.log = consoleLogMock;

afterEach(() => {
  consoleErrorMock.mockReset();
  consoleLogMock.mockReset();
});

it("should exit with 1 and present help if no command is provided", async () => {
  const result = await createCli()
    .useCommand("test", async () => {})
    .run(["--not-a-command"]);

  expect(result.code).toBe(1);
  expect(consoleErrorMock).toHaveBeenCalledWith("Please provide a command.");
});

it("should only execute correct command", async () => {
  const result = await createCli()
    .useCommand("hello", async (ctx, next) => {
      console.log("hello world");
      await next();
    })
    .useCommand("goodbye", async (ctx, next) => {
      console.log("goodbye world");
      await next();
    })
    .run(["hello"]);

  expect(result.code).toBe(0);
  expect(consoleLogMock).toHaveBeenCalledWith("hello world");
  expect(consoleLogMock).not.toHaveBeenCalledWith("goodbye world");
});
