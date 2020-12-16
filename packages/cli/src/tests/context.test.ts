import { Context, createCli } from "../main";

it("should pass context down middleware chain", async () => {
  await createCli()
    .use(async (ctx: { value: string } & Context, next) => {
      ctx.value = "hello world";
      await next();
    })
    .use(async (ctx: { value: string } & Context, next) => {
      expect(ctx.value).toBe("hello world");
    })
    .run([]);
});
