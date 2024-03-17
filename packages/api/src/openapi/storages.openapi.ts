import { createRoute, z } from "@hono/zod-openapi";
import {
  badRequestErrorSchema,
  forbiddenErrorSchema,
  internalServerErrorSchema,
} from "../common/schema.js";
import {
  createStorageSchema,
  paginatedStoragesResponseSchema,
  paginatedStoragesSearchSchema,
  createStorageResponseSchema,
} from "../common/storages.schema.js";

const storageIdSchema = z.string().openapi({
  param: {
    name: "id",
    in: "path",
  },
  example: "lf4148s3nex9qe3h3tsqje2d",
});

export const getPaginatedStoragesRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Storages"],
  request: {
    query: paginatedStoragesSearchSchema,
  },
  responses: {
    200: {
      description: "Get paginated storages",
      content: {
        "application/json": {
          schema: paginatedStoragesResponseSchema,
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

export const createStorageRoute = createRoute({
  path: "/",
  method: "post",
  tags: ["Storages"],
  request: {
    body: {
      description: "Create storage schema",
      content: {
        "application/json": {
          schema: createStorageSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Create storage",
      content: {
        "application/json": {
          schema: createStorageResponseSchema,
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
