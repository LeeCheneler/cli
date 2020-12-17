import { EXAMPE_CLI_OPTIONS } from "../test-utils/cli-options";
import { mockConsole } from "../test-utils/console";
import { Context, createCli } from "../main";

const consoleMock = mockConsole();

afterEach(() => {
  consoleMock.reset();
});

it("should attach args and parsed to the context", async () => {
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
      expect(ctx.args).toEqual(args.slice(1));
      expect(ctx.parsedArgs).toEqual({
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
  expect(console.error).toHaveBeenCalledWith(`Argument "first" is required.`);
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
  expect(console.error).toHaveBeenCalledWith(`Positional "first" is required.`);
});

it("should enforce argument types", async () => {
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
    .run(["example", "--first=5"]);

  expect(result.code).toBe(1);
  expect(console.error).toHaveBeenCalledWith(
    `Argument "first" must be of type string.`
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
    `Positional "first" must be of type number.`
  );
});
