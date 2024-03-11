import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import * as dotenv from "dotenv";
dotenv.config();

export const env = createEnv({
  server: {
    ALLOWED_ORIGIN: z.string().url(),
    PORT: z.coerce.number(z.string().min(1)),
    TOKEN_SECRET: z.string().min(1),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "PUBLIC_",

  client: {},

  shared: {
    NODE_ENV: z.union([
      z.literal("development"),
      z.literal("production"),
      z.literal("test"),
    ]),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});
