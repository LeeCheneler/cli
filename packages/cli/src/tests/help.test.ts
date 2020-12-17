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

${EXAMPE_CLI_OPTIONS.name} [command] [positional] [--argument]

Commands:

version - Display version.
help    - Display help.

Run "${EXAMPE_CLI_OPTIONS.name} help [command]" for command usage.`);
});

it("should exit with 1 and suggest running help if unknown command is provided", async () => {
  const result = await createCli(EXAMPE_CLI_OPTIONS).run(["help", "unknown"]);

  expect(result.code).toBe(1);
  expect(consoleMock.error).toHaveBeenCalledWith(
    `Command "unknown" not recognised. Run "${EXAMPE_CLI_OPTIONS.name} help" to see a list of commands.`
  );
});

describe("command help", () => {
  it("no positionals or arguments", async () => {
    const result = await createCli(EXAMPE_CLI_OPTIONS)
      .useCommand("example", "Example command.", async () => {})
      .run(["help", "example"]);

    expect(result.code).toBe(0);
    expect(consoleMock.log).toHaveBeenCalledWith(`Example command.

Usage:

${EXAMPE_CLI_OPTIONS.name} example`);
  });

  it("positionals", async () => {
    const result = await createCli(EXAMPE_CLI_OPTIONS)
      .useCommand("example", "Example command.", async () => {}, {
        positionals: [
          {
            name: "first",
            description: "First positional.",
            type: "string",
            required: true,
          },
          {
            name: "second",
            description: "Second positional.",
            type: "number",
          },
        ],
      })
      .run(["help", "example"]);

    expect(result.code).toBe(0);
    expect(consoleMock.log).toHaveBeenCalledWith(`Example command.

Usage:

${EXAMPE_CLI_OPTIONS.name} example [positional]

Positionals:

first  - First positional.  (string, required)
second - Second positional. (number)`);
  });

  it("arguments", async () => {
    const result = await createCli(EXAMPE_CLI_OPTIONS)
      .useCommand("example", "Example command.", async () => {}, {
        arguments: [
          {
            name: "first",
            description: "First argument.",
            type: "string",
            required: true,
          },
          {
            name: "second",
            description: "Second argument.",
            type: "number",
            required: true,
          },
          {
            name: "third",
            description: "Third argument.",
            type: "boolean",
            required: false,
          },
        ],
      })
      .run(["help", "example"]);

    expect(result.code).toBe(0);
    expect(consoleMock.log).toHaveBeenCalledWith(`Example command.

Usage:

${EXAMPE_CLI_OPTIONS.name} example [--argument]

Arguments:

first  - First argument.  (string, required)
second - Second argument. (number, required)
third  - Third argument.  (boolean)`);
  });

  it("positionals and arguments", async () => {
    const result = await createCli(EXAMPE_CLI_OPTIONS)
      .useCommand("example", "Example command.", async () => {}, {
        positionals: [
          {
            name: "first",
            description: "First positional.",
            type: "string",
            required: true,
          },
          {
            name: "second",
            description: "Second positional.",
            type: "number",
          },
        ],
        arguments: [
          {
            name: "third",
            description: "Third argument.",
            type: "string",
            required: true,
          },
          {
            name: "fourth",
            description: "Fourth argument.",
            type: "number",
            required: true,
          },
          {
            name: "fifth",
            description: "Fifth argument.",
            type: "boolean",
            required: false,
          },
        ],
      })
      .run(["help", "example"]);

    expect(result.code).toBe(0);
    expect(consoleMock.log).toHaveBeenCalledWith(`Example command.

Usage:

${EXAMPE_CLI_OPTIONS.name} example [positional] [--argument]

Positionals:

first  - First positional.  (string, required)
second - Second positional. (number)

Arguments:

third  - Third argument.  (string, required)
fourth - Fourth argument. (number, required)
fifth  - Fifth argument.  (boolean)`);
  });
});
