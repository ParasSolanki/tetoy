import { createRoute, z } from "@hono/zod-openapi";
import {
  badRequestErrorSchema,
  conflictErrorSchema,
  forbiddenErrorSchema,
  internalServerErrorSchema,
} from "../common/schema.js";
import {
  createCategoryResponseSchema,
  createCategorySchema,
  deleteCatgoryResponseSchema,
  getAllCategoriesResponseSchema,
  getAllCategoriesSearchSchema,
  getCategoryResponseSchema,
  paginatedCategoriesResponseSchema,
  paginatedCategoriesSearchSchema,
  updateCategoryResponseSchema,
  updateCategorySchema,
} from "../common/categories.schema.js";

const categoryIdSchema = z.string().openapi({
  param: {
    name: "id",
    in: "path",
  },
  example: "lf4148s3nex9qe3h3tsqje2d",
});

export const getPaginatedCategoriesRoute = createRoute({
  path: "/",
  method: "get",
  tags: ["Categories"],
  request: {
    query: paginatedCategoriesSearchSchema,
  },
  responses: {
    200: {
      description: "Get paginated categories",
      content: {
        "application/json": {
          schema: paginatedCategoriesResponseSchema,
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

export const getAllCategoriesRoute = createRoute({
  path: "/all",
  method: "get",
  tags: ["Categories"],
  request: {
    query: getAllCategoriesSearchSchema,
  },
  responses: {
    200: {
      description: "Get all categories with cursor pagination and search",
      content: {
        "application/json": {
          schema: getAllCategoriesResponseSchema,
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

export const createCategoryRoute = createRoute({
  path: "/",
  method: "post",
  tags: ["Categories"],
  request: {
    body: {
      description: "Create category body",
      content: {
        "application/json": {
          schema: createCategorySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Create category",
      content: {
        "application/json": {
          schema: createCategoryResponseSchema,
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
    409: {
      description: "Conflict request",
      content: {
        "application/json": {
          schema: conflictErrorSchema,
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

export const getCategoryRoute = createRoute({
  path: "/{id}",
  method: "get",
  tags: ["Categories"],
  request: {
    params: z.object({
      id: categoryIdSchema,
    }),
  },
  responses: {
    200: {
      description: "Get specific category",
      content: {
        "application/json": {
          schema: getCategoryResponseSchema,
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

export const updateCategoryRoute = createRoute({
  path: "/{id}",
  method: "put",
  tags: ["Categories"],
  request: {
    params: z.object({
      id: categoryIdSchema,
    }),
    body: {
      description: "Update category body",
      content: {
        "application/json": {
          schema: updateCategorySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Update category",
      content: {
        "application/json": {
          schema: updateCategoryResponseSchema,
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
    409: {
      description: "Conflict request",
      content: {
        "application/json": {
          schema: conflictErrorSchema,
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

export const deleteCategoryRoute = createRoute({
  path: "/{id}",
  method: "delete",
  tags: ["Categories"],
  request: {
    params: z.object({
      id: categoryIdSchema,
    }),
  },
  responses: {
    200: {
      description: "Delete (Soft) specific category",
      content: {
        "application/json": {
          schema: deleteCatgoryResponseSchema,
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
