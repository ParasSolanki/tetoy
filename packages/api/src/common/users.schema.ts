import { z } from "zod";
import { successSchema } from "./schema.js";

export const getAllUsersSearchSchema = z.object({
  name: z.string().optional(),
  cursor: z.coerce.number(z.string()).optional(),
});

export const getAllUsersResponseSchema = successSchema.extend({
  data: z.object({
    users: z
      .object({
        id: z.string(),
        displayName: z.string().nullable(),
        createdAt: z.string(),
      })
      .array(),
    cursor: z.number().optional(),
  }),
});
