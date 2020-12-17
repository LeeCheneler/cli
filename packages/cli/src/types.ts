import { ParsedArgs } from "minimist";

export interface Positional {
  name: string;
  description: string;
  type: "number" | "string";
  required?: boolean;
}

export interface Argument {
  name: string;
  description: string;
  type: "boolean" | "number" | "string";
  required?: boolean;
}

export interface Context<TParsedArgs = {}> {
  args: string[];
  code: number;
  commands: {
    name: string;
    description: string;
    positionals?: Positional[];
    arguments?: Argument[];
  }[];
  commandName: string | null;
  parsedArgs: TParsedArgs & ParsedArgs;
  throw: (code: number, message: string) => void;
}

export type NextFunction = () => Promise<void>;

export type MiddlwareFunction = (ctx: any, next: NextFunction) => Promise<void>;
