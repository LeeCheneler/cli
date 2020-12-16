import { EXAMPE_CLI_OPTIONS } from "../test-utils/cli-options";
import { mockConsole } from "../test-utils/console";
import { createCli } from "../main";

const consoleMock = mockConsole();

afterEach(() => {
  consoleMock.reset();
});

it("should print help", async () => {
  const result = await createCli(EXAMPE_CLI_OPTIONS).run(["help"]);

  expect(result.code).toBe(0);
  expect(consoleMock.log)
    .toHaveBeenCalledWith(`${EXAMPE_CLI_OPTIONS.description}

Usage:

${EXAMPE_CLI_OPTIONS.name} [command] [...options]

Commands:

version - Display version.
help    - Display help.`);
});
