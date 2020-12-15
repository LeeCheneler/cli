import { bootstrap } from "../bootstrap";
import pkg from "../../package.json";

const consoleLogMock = jest.fn();
console.log = consoleLogMock;

afterEach(() => {
  consoleLogMock.mockReset();
});

it("should print the version", async () => {
  const result = await bootstrap().run(["version"]);

  expect(result.code).toBe(0);
  expect(consoleLogMock).toHaveBeenCalledWith(pkg.version);
});
