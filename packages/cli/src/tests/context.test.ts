import { EXAMPE_CLI_OPTIONS } from "../test-utils/cli-options";
import { Context, createCli } from "../main";

it("should pass context down middleware chain", async () => {
  await createCli(EXAMPE_CLI_OPTIONS)
    .use(async (ctx: { value: string } & Context, next) => {
      ctx.value = "hello world";
      await next();
    })
    .use(async (ctx: { value: string } & Context) => {
      expect(ctx.value).toBe("hello world");
    })
    .run([]);
});
