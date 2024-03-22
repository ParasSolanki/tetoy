import { createRoute } from "@hono/zod-openapi";
import {
  getAllUsersSearchSchema,
  getAllUsersResponseSchema,
} from "../common/users.schema.js";
import {
  badRequestErrorSchema,
  forbiddenErrorSchema,
  internalServerErrorSchema,
} from "../common/schema.js";

export const getAllUsersRoute = createRoute({
  path: "/all",
  method: "get",
  tags: ["users"],
  request: {
    query: getAllUsersSearchSchema,
  },
  responses: {
    200: {
      description: "Get all users with cursor pagination and search",
      content: {
        "application/json": {
          schema: getAllUsersResponseSchema,
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
