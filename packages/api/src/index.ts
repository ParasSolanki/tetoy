import { serve } from "@hono/node-server";
import { env } from "./env.js";
import { app } from "./app.js";

const PORT = env.PORT;

console.log(`Server is running on port ${PORT} http://localhost:${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT,
});
