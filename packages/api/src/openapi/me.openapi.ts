import { createRoute } from "@hono/zod-openapi";
import {
  badRequestErrorSchema,
  forbiddenErrorSchema,
  internalServerErrorSchema,
} from "../common/schema";
import {
  updateMeDisplayNameResponseSchema,
  updateMeDisplayNameSchema,
} from "../common/me.schema";

export const updateMeDisplayNameRoute = createRoute({
  path: "/display-name",
  method: "patch",
  tags: ["Me"],
  request: {
    body: {
      description: "Update display name request body",
      content: {
        "application/json": {
          schema: updateMeDisplayNameSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Update user display name",
      content: {
        "application/json": {
          schema: updateMeDisplayNameResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request",
      content: {
        "application/json": {
          schema: badRequestErrorSchema,
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
