import { EXAMPE_CLI_OPTIONS } from "../test-utils/cli-options";
import { mockConsole } from "../test-utils/console";
import { Context, createCli } from "../main";

const consoleMock = mockConsole();

afterEach(() => {
  consoleMock.reset();
});

it("should attach options to the context", async () => {
  const args = [
    "version",
    "hello",
    "world",
    "--one",
    "1",
    "--two=two",
    "--bool",
    "-abc",
  ];
  await createCli(EXAMPE_CLI_OPTIONS)
    .use(async (ctx: { value: string } & Context) => {
      expect(ctx.rawOptions).toEqual(args.slice(1));
      expect(ctx.options).toEqual({
        _: ["hello", "world"],
        one: 1,
        two: "two",
        bool: true,
        a: true,
        b: true,
        c: true,
      });
    })
    .run(args);
});

it("should enforce required arguments", async () => {
  const result = await createCli(EXAMPE_CLI_OPTIONS)
    .useCommand("example", "Example command.", async () => {}, {
      arguments: [
        {
          name: "first",
          description: "First.",
          type: "string",
          required: true,
        },
      ],
    })
    .run(["example"]);

  expect(result.code).toBe(1);
  expect(console.error).toHaveBeenCalledWith(`Option --first is required.

Run "${EXAMPE_CLI_OPTIONS.name} help example" to see help for this command.`);
});

it("should enforce required positionals", async () => {
  const result = await createCli(EXAMPE_CLI_OPTIONS)
    .useCommand("example", "Example command.", async () => {}, {
      positionals: [
        {
          name: "first",
          description: "First.",
          type: "string",
          required: true,
        },
      ],
    })
    .run(["example"]);

  expect(result.code).toBe(1);
  expect(console.error).toHaveBeenCalledWith(`Option [first] is required.

Run "${EXAMPE_CLI_OPTIONS.name} help example" to see help for this command.`);
});

it("should enforce argument types", async () => {
  const result = await createCli(EXAMPE_CLI_OPTIONS)
    .useCommand("example", "Example command.", async () => {}, {
      arguments: [
        {
          name: "first",
          description: "First.",
          type: "number",
        },
      ],
    })
    .run(["example", "--first=abc"]);

  expect(result.code).toBe(1);
  expect(console.error).toHaveBeenCalledWith(
    `Option --first must be of type number.

Run "${EXAMPE_CLI_OPTIONS.name} help example" to see help for this command.`
  );
});

it("should enforce positionals types", async () => {
  const result = await createCli(EXAMPE_CLI_OPTIONS)
    .useCommand("example", "Example command.", async () => {}, {
      positionals: [
        {
          name: "first",
          description: "First.",
          type: "number",
        },
      ],
    })
    .run(["example", "five"]);

  expect(result.code).toBe(1);
  expect(console.error).toHaveBeenCalledWith(
    `Option [first] must be of type number.

Run "${EXAMPE_CLI_OPTIONS.name} help example" to see help for this command.`
  );
});

it("should only allow the last positional to be an array", async () => {
  expect(() =>
    createCli(EXAMPE_CLI_OPTIONS).useCommand(
      "example",
      "Example command.",
      async () => {},
      {
        positionals: [
          {
            name: "first",
            description: "First.",
            type: "number",
            array: true,
          },
          {
            name: "second",
            description: "Second.",
            type: "number",
          },
        ],
      }
    )
  ).toThrowError(
    `Positional "first" can not be an array. Only the last positional can be an array.`
  );
});

it("should parse boolean options as booleans", async () => {
  const result = await createCli(EXAMPE_CLI_OPTIONS)
    .useCommand("example", "Example command.", async () => {}, {
      arguments: [
        {
          name: "first",
          description: "First.",
          type: "boolean",
        },
      ],
    })
    .use(async (ctx: Context<{ first: boolean }>) => {
      expect(ctx.options.first).toBe(true);
    })
    .run(["example", "--first=true"]);

  expect(result.code).toBe(0);
});

it("should default boolean options to false", async () => {
  const result = await createCli(EXAMPE_CLI_OPTIONS)
    .useCommand("example", "Example command.", async () => {}, {
      arguments: [
        {
          name: "first",
          description: "First.",
          type: "boolean",
        },
      ],
    })
    .use(async (ctx: Context<{ first: boolean }>) => {
      expect(ctx.options.first).toBe(false);
    })
    .run(["example"]);

  expect(result.code).toBe(0);
});

it("should parse numbers as strings when option is string type", async () => {
  const result = await createCli(EXAMPE_CLI_OPTIONS)
    .useCommand("example", "Example command.", async () => {}, {
      arguments: [
        {
          name: "first",
          description: "First.",
          type: "string",
        },
      ],
    })
    .use(async (ctx: Context<{ first: boolean }>) => {
      expect(ctx.options.first).toBe("123");
    })
    .run(["example", "--first=123"]);

  expect(result.code).toBe(0);
});
