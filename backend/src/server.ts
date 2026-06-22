import { app } from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`API server listening on http://localhost:${env.PORT}`);
});
const keepAlive = setInterval(() => undefined, 60 * 60 * 1000);

function shutdown(signal: NodeJS.Signals) {
  console.log(`${signal} received, shutting down API server`);
  clearInterval(keepAlive);
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
