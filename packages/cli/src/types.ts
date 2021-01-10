import { ParsedArgs } from "minimist";

export interface Positional {
  name: string;
  description: string;
  type: "number" | "string";
  required?: boolean;
  array?: boolean;
}

export interface Argument {
  name: string;
  description: string;
  type: "boolean" | "number" | "string" | "object";
  required?: boolean;
}

export interface Context<TOptions = {}> {
  rawOptions: string[];
  code: number;
  commands: {
    name: string;
    description: string;
    positionals?: Positional[];
    arguments?: Argument[];
  }[];
  commandName: string | null;
  options: TOptions & ParsedArgs;
  throw: (code: number, message: string) => void;
}

export type NextFunction = () => Promise<void>;

export type MiddlwareFunction = (ctx: any, next: NextFunction) => Promise<void>;
