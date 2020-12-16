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
