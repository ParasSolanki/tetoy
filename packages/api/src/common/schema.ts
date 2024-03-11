import { z } from "@hono/zod-openapi";

const errorSchema = z.object({
  ok: z.boolean().default(false),
  message: z.string(),
});

export const successSchema = z.object({
  ok: z.boolean().default(true),
});

// 400
export const badRequestErrorSchema = errorSchema.extend({
  code: z.string().default("BAD_REQUEST"),
  errors: z.object({}).optional(),
});

// 401
export const unauthorizedErrorSchema = errorSchema.extend({
  code: z.string().default("UNAUTHORIZED"),
});

// 403
export const forbiddenErrorSchema = errorSchema.extend({
  code: z.string().default("FORBIDDEN"),
});

// 409
export const conflictErrorSchema = errorSchema.extend({
  code: z.string().default("CONFLICT"),
});

// 500
export const internalServerErrorSchema = errorSchema.extend({
  code: z.string().default("INTERNAL_SERVER_ERROR"),
});
