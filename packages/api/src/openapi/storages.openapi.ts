import { createRoute, z } from "@hono/zod-openapi";
import {
  badRequestErrorSchema,
  conflictErrorSchema,
  forbiddenErrorSchema,
  internalServerErrorSchema,
} from "../common/schema.js";
import {
  createStorageSchema,
  paginatedStoragesResponseSchema,
  paginatedStoragesSearchSchema,
  createStorageResponseSchema,
  getStorageResponseSchema,
  deleteStorageResponseSchema,
  getStorageLogsResponseSchema,
  getStorageLogsSearchSchema,
  paginatedStorageBlockBoxesSearchSchema,
  paginatedStorageBlockBoxesResponseSchema,
  createStorageBoxSchema,
  createStorageBoxResponseSchema,
  deleteStorageBoxResponseSchema,
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
    409: {
      description: "Conflict",
      content: {
        "application/json": {
          schema: conflictErrorSchema,
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

export const getStorageRoute = createRoute({
  path: "/{id}",
  method: "get",
  tags: ["Storages"],
  request: {
    params: z.object({
      id: storageIdSchema,
    }),
  },
  responses: {
    201: {
      description: "Get storage",
      content: {
        "application/json": {
          schema: getStorageResponseSchema,
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

export const deleteStorageRoute = createRoute({
  path: "/{id}",
  method: "delete",
  tags: ["Storages"],
  request: {
    params: z.object({
      id: storageIdSchema,
    }),
  },
  responses: {
    200: {
      description: "Delete storage",
      content: {
        "application/json": {
          schema: deleteStorageResponseSchema,
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

export const getStorageLogsRoute = createRoute({
  path: "/{id}/logs",
  method: "get",
  tags: ["Storages"],
  request: {
    query: getStorageLogsSearchSchema,
    params: z.object({
      id: storageIdSchema,
    }),
  },
  responses: {
    200: {
      description: "Get storage logs",
      content: {
        "application/json": {
          schema: getStorageLogsResponseSchema,
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

const storageBlockIdSchema = z.string().openapi({
  param: {
    name: "blockId",
    in: "path",
  },
  example: "lf4148s3nex9qe3h3tsqje2d",
});

export const paginatedStorageBlockBoxesRoute = createRoute({
  path: "/{id}/blocks/{blockId}/boxes",
  method: "get",
  tags: ["Storages"],
  request: {
    query: paginatedStorageBlockBoxesSearchSchema,
    params: z.object({
      id: storageIdSchema,
      blockId: storageBlockIdSchema,
    }),
  },
  responses: {
    200: {
      description: "Get storage block boxes",
      content: {
        "application/json": {
          schema: paginatedStorageBlockBoxesResponseSchema,
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

export const createStorageBoxRoute = createRoute({
  path: "/{id}/blocks/{blockId}/boxes",
  method: "post",
  tags: ["Storages"],
  request: {
    params: z.object({
      id: storageIdSchema,
      blockId: storageBlockIdSchema,
    }),
    body: {
      description: "Create storage box body payload",
      content: {
        "application/json": {
          schema: createStorageBoxSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Create storage box",
      content: {
        "application/json": {
          schema: createStorageBoxResponseSchema,
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

const storageBoxIdSchema = z.string().openapi({
  param: {
    name: "boxId",
    in: "path",
  },
  example: "lf4148s3nex9qe3h3tsqje2d",
});

export const deleteStorageBoxRoute = createRoute({
  path: "/{id}/blocks/{blockId}/boxes/{boxId}",
  method: "delete",
  tags: ["Storages"],
  request: {
    params: z.object({
      id: storageIdSchema,
      blockId: storageBlockIdSchema,
      boxId: storageBoxIdSchema,
    }),
  },
  responses: {
    200: {
      description: "Delete storage box",
      content: {
        "application/json": {
          schema: deleteStorageBoxResponseSchema,
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
