import { createRoute } from "@hono/zod-openapi";
import { getCountriesResponseSchema } from "../common/countries.schema.js";
import {
  forbiddenErrorSchema,
  internalServerErrorSchema,
} from "../common/schema.js";

export const getCountriesRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Countries"],
  responses: {
    200: {
      description: "Get all countries",
      content: {
        "application/json": {
          schema: getCountriesResponseSchema,
        },
      },
    },
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: forbiddenErrorSchema,
        },
      },
    },
    500: {
      description: "Something went wrong",
      content: {
        "application/json": {
          schema: internalServerErrorSchema,
        },
      },
    },
  },
});
