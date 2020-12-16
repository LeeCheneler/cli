import { ParsedArgs } from "minimist";

export interface Context<TParsedArgs = {}> {
  args: string[];
  code: number;
  commands: {
    name: string;
    description: string;
  }[];
  parsedArgs: TParsedArgs & ParsedArgs;
  throw: (code: number, message: string) => void;
  assert: (passed: boolean, message: string) => void;
  assertType: (
    name: string,
    value: any,
    expectedType: "boolean" | "number" | "string"
  ) => void;
  assertRequired: (name: string, value: any) => void;
}

export type NextFunction = () => Promise<void>;

export type MiddlwareFunction = (ctx: any, next: NextFunction) => Promise<void>;
