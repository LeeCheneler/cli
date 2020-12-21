# @leecheneler/cli

Write command based CLI tools using TypeScript.

## Installation

```sh
yarn add @leecheneler/cli
```

### Getting started

A basic CLI tool example:

```ts
import { createCli, Context, NextFunction } from "@leecheneler/cli";

interface HelloArgs {
  name: string;
}

const hello = async (ctx: Context<HelloArgs>, next: NextFunction) => {
  console.log(`Hello ${ctx.parsedArgs.name}!`);

  await next();
};

const cli = createCli({
  name: "example",
  description: "Example CLI.",
  version: "1.0.0",
});

cli.useCommand("hello", "Say hello.", hello, {
  arguments: [
    {
      name: "name",
      description: "Name to say hello to.",
      type: "string",
      required: true,
    },
  ],
});

cli
  .run(process.argv.slice(2))
  .then((result) => {
    process.exit(result.code);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

/*
 * > example hello --name Mary
 * > Hello Mary!
 */
```

On a successful run the returned promise will resolve with code `0`. If an unexpected error occurred then it will throw with the error.

## Middleware

Chain middleware using `.use(...)`. This is useful to enrich the context for later middleware to use among other things. Below is an example middleware adding a logger to the context and a later middleware using it.

```ts
cli
  .use(async (ctx: Context, next: NextFunction) => {
    ctx.logger = console;

    await next();
  })
  .use(async (ctx: Context, next: NextFunction) => {
    ctx.logger.log("Hello world!");

    await next();
  });
```

## Commands

Commands are just special middleware. You register a command using `.useCommand(...)`. Commands will be displayed when running help automatically.

Below is a very simple command that prints hello world.

```ts
cli.useCommand(
  "hello",
  "Say hello.",
  async (ctx: Context, next: NextFunction) => {
    console.log("Hello world!");
  }
);
```

### Arguments

You can pass arguments to a command via `--arg-name` syntax. Args are parsed into `ctx.parsedArgs` as keys with matching names on the object via [minimist](https://www.npmjs.com/package/minimist).

Supported types: `boolean | number | object | string`.

Below is an example of a command that takes an argument.

```ts
interface HelloArgs {
  name: string;
}

cli.useCommand(
  "hello",
  "Say hello.",
  async (ctx: Context<HelloArgs>, next: NextFunction) => {
    console.log(`Hello ${ctx.parsedArgs.name}!`);

    await next();
  },
  {
    arguments: [
      {
        name: "name",
        description: "Name to say hello to.",
        type: "string",
        required: true,
      },
    ],
  }
);

/*
 * > example hello --name Mary
 * > Hello Mary!
 */
```

### Positionals

You can pass positionals to a command via values in the command not associated to an argument. Positionals are parsed into `ctx.parsedArgs._` as values in an array via [minimist](https://www.npmjs.com/package/minimist).

Supported types: `number | string`.

Below is a simple example with a positional argument:

```ts
cli.useCommand(
  "hello",
  "Say hello.",
  async (ctx: Context, next: NextFunction) => {
    const [name] = ctx.parsedArgs._;
    console.log(`Hello ${name}!`);

    await next();
  },
  {
    positionals: [
      {
        name: "name",
        description: "Name to say hello to.",
        type: "string",
        required: true,
      },
    ],
  }
);

/*
 * > example hello Mary
 * > Hello Mary!
 */
```

## Expected errors conveniance API

There is a conveniance API to log to stderr and resolve with a given code using `ctx.throw(...)`.

Exiting with code `1` and logging `Example error message.` to stderr:

```ts
ctx.throw(1, "Example error message.");
```

## Default commands

There are a couple of baked in default commands:

- `help` - Displays help with list of commands, `help [command]` displays help for specific commands.
- `version` - Displays the current version
