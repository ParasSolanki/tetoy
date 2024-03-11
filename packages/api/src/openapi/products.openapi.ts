import { createRoute, z } from "@hono/zod-openapi";
import {
  badRequestErrorSchema,
  conflictErrorSchema,
  forbiddenErrorSchema,
  internalServerErrorSchema,
} from "../common/schema";
import {
  createProductResponseSchema,
  createProductSchema,
  deleteProductResponseSchema,
  getAllProductsResponseSchema,
  getAllProductsSearchSchema,
  getProductResponseSchema,
  paginatedProductsResponseSchema,
  paginatedProductsSearchSchema,
  updateProductResponseSchema,
  updateProductSchema,
} from "../common/product.schema";

const productIdSchema = z.string().openapi({
  param: {
    name: "id",
    in: "path",
  },
  example: "lf4148s3nex9qe3h3tsqje2d",
});

export const getPaginatedProductsRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Products"],
  request: {
    query: paginatedProductsSearchSchema,
  },
  responses: {
    200: {
      description: "Get paginated products",
      content: {
        "application/json": {
          schema: paginatedProductsResponseSchema,
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

export const getAllProductsRoute = createRoute({
  path: "/all",
  method: "get",
  tags: ["Products"],
  request: {
    query: getAllProductsSearchSchema,
  },
  responses: {
    200: {
      description: "Get all products with cursor pagination and search",
      content: {
        "application/json": {
          schema: getAllProductsResponseSchema,
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

export const createProductRoute = createRoute({
  path: "/",
  method: "post",
  tags: ["Products"],
  request: {
    body: {
      description: "Create product request body",
      content: {
        "application/json": {
          schema: createProductSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Create product",
      content: {
        "application/json": {
          schema: createProductResponseSchema,
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

export const getProductRoute = createRoute({
  path: "/{id}",
  method: "get",
  tags: ["Products"],
  request: {
    params: z.object({
      id: productIdSchema,
    }),
  },
  responses: {
    200: {
      description: "Get specific product",
      content: {
        "application/json": {
          schema: getProductResponseSchema,
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

export const updateProductRoute = createRoute({
  path: "/{id}",
  method: "put",
  tags: ["Products"],
  request: {
    params: z.object({
      id: productIdSchema,
    }),
    body: {
      description: "Update product request body",
      content: {
        "application/json": {
          schema: updateProductSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Update product",
      content: {
        "application/json": {
          schema: updateProductResponseSchema,
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

export const deleteProductRoute = createRoute({
  path: "/{id}",
  method: "delete",
  tags: ["Products"],
  request: {
    params: z.object({
      id: productIdSchema,
    }),
  },
  responses: {
    200: {
      description: "Delete (Soft) specific product",
      content: {
        "application/json": {
          schema: deleteProductResponseSchema,
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
