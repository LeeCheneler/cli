import { bootstrap } from "./bootstrap";

bootstrap()
  .run(process.argv.slice(2))
  .then((result) => {
    process.exit(result.code);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
