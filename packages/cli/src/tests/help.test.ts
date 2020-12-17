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
            required: true,
          },
          {
            name: "third",
            description: "Third positional.",
            type: "boolean",
            required: false,
          },
        ],
      })
      .run(["help", "example"]);

    expect(result.code).toBe(0);
    expect(consoleMock.log).toHaveBeenCalledWith(`Example command.

Usage:

${EXAMPE_CLI_OPTIONS.name} example [first] [second] [third]

Positionals:

first  - First positional.  (string, required)
second - Second positional. (number, required)
third  - Third positional.  (boolean)`);
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

${EXAMPE_CLI_OPTIONS.name} example

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
            required: true,
          },
          {
            name: "third",
            description: "Third positional.",
            type: "boolean",
            required: false,
          },
        ],
        arguments: [
          {
            name: "fourth",
            description: "Fourth argument.",
            type: "string",
            required: true,
          },
          {
            name: "fifth",
            description: "Fifth argument.",
            type: "number",
            required: true,
          },
          {
            name: "sixth",
            description: "Sixth argument.",
            type: "boolean",
            required: false,
          },
        ],
      })
      .run(["help", "example"]);

    expect(result.code).toBe(0);
    expect(consoleMock.log).toHaveBeenCalledWith(`Example command.

Usage:

${EXAMPE_CLI_OPTIONS.name} example [first] [second] [third]

Positionals:

first  - First positional.  (string, required)
second - Second positional. (number, required)
third  - Third positional.  (boolean)

Arguments:

fourth - Fourth argument. (string, required)
fifth  - Fifth argument.  (number, required)
sixth  - Sixth argument.  (boolean)`);
  });
});