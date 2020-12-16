import { createCli, Context } from "../main";

const consoleErrorMock = jest.fn();
console.error = consoleErrorMock;

afterEach(() => {
  consoleErrorMock.mockReset();
});

describe("ctx.throw()", () => {
  it("should exit with correct code and log error message to stderr", async () => {
    const result = await createCli()
      .use(async (ctx: Context) => {
        ctx.throw(1, "Throw with 1");
      })
      .run([]);

    expect(result.code).toBe(1);
    expect(consoleErrorMock).toHaveBeenCalledWith("Throw with 1");
  });
});

describe("thrown error", () => {
  it("should throw the error", async () => {
    const error = new Error();
    expect(() =>
      createCli()
        .use(async () => {
          throw error;
        })
        .run([])
    ).rejects.toThrowError(error);
  });
});
