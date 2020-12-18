import { EXAMPE_CLI_OPTIONS } from "../test-utils/cli-options";
import { mockConsole } from "../test-utils/console";
import { createCli, Context } from "../main";

const consoleMock = mockConsole();

afterEach(() => {
  consoleMock.reset();
});

describe("ctx.throw()", () => {
  it("should exit with correct code and log error message to stderr", async () => {
    const result = await createCli(EXAMPE_CLI_OPTIONS)
      .use(async (ctx: Context) => {
        ctx.throw(1, "Throw with 1");
      })
      .run(["version"]);

    expect(result.code).toBe(1);
    expect(consoleMock.error).toHaveBeenCalledWith("Throw with 1");
  });
});

describe("thrown error", () => {
  it("should throw the error", async () => {
    const error = new Error();
    await expect(() =>
      createCli(EXAMPE_CLI_OPTIONS)
        .use(async () => {
          throw error;
        })
        .run(["version"])
    ).rejects.toThrowError(error);
  });
});
