import { Context, createCli } from "../main";

it("should pass context down middleware chain", async () => {
  let value = null;

  await createCli()
    .use(async (ctx: { value: string } & Context, next) => {
      ctx.value = "hello world";
      await next();
    })
    .use(async (ctx: { value: string } & Context, next) => {
      value = ctx.value;
    })
    .run([]);

  expect(value).toBe("hello world");
});
