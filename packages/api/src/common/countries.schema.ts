import { z } from "zod";
import { successSchema } from "./schema.js";

export const getCountriesResponseSchema = successSchema.extend({
  data: z.object({
    countries: z
      .object({
        id: z.string(),
        name: z.string(),
      })
      .array(),
  }),
});
