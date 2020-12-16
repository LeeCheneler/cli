import { EXAMPE_CLI_OPTIONS } from "../test-utils/cli-options";
import { mockConsole } from "../test-utils/console";
import { Context, createCli } from "../main";

const consoleMock = mockConsole();

afterEach(() => {
  consoleMock.reset();
});

it("should pass context down middleware chain", async () => {
  await createCli(EXAMPE_CLI_OPTIONS)
    .use(async (ctx: { value: string } & Context, next) => {
      ctx.value = "hello world";
      await next();
    })
    .use(async (ctx: { value: string } & Context) => {
      expect(ctx.value).toBe("hello world");
    })
    .run(["version"]);
});
