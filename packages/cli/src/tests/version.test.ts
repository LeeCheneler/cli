import { createCli, middleware } from "../main";

const consoleLogMock = jest.fn();
console.log = consoleLogMock;

afterEach(() => {
  consoleLogMock.mockReset();
});

it("should print the version", async () => {
  const result = await createCli()
    .useCommand("version", middleware.version("1.0.0"))
    .run(["version"]);

  expect(result.code).toBe(0);
  expect(consoleLogMock).toHaveBeenCalledWith("1.0.0");
});
