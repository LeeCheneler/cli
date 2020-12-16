interface MockConsoleResult {
  log: jest.Mock;
  error: jest.Mock;
  warn: jest.Mock;
  restore: () => void;
  reset: () => void;
}

export const mockConsole = (): MockConsoleResult => {
  const consoleLogMock = jest.fn();
  const consoleErrorMock = jest.fn();
  const consoleWarnMock = jest.fn();

  console.log = consoleLogMock;
  console.error = consoleErrorMock;
  console.warn = consoleWarnMock;

  return {
    log: consoleLogMock,
    error: consoleErrorMock,
    warn: consoleWarnMock,
    reset: () => {
      consoleLogMock.mockReset();
      consoleErrorMock.mockReset();
      consoleWarnMock.mockReset();
    },
    restore: () => {
      consoleLogMock.mockRestore();
      consoleErrorMock.mockRestore();
      consoleWarnMock.mockRestore();
    },
  };
};
