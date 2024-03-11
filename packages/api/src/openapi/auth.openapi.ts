import { createRoute, z } from "@hono/zod-openapi";
import {
  authResponseSchema,
  authSchema,
  csrfTokenResponseSchema,
} from "../common/auth.schema";
import {
  badRequestErrorSchema,
  conflictErrorSchema,
  forbiddenErrorSchema,
  internalServerErrorSchema,
  successSchema,
  unauthorizedErrorSchema,
} from "../common/schema";

const headersSchema = z.object({
  "x-csrf-token": z
    .string({
      required_error: "Token is required",
    })
    .min(1, "Token is required"),
});

export const signupRoute = createRoute({
  path: "/signup",
  method: "post",
  tags: ["Authorization"],
  request: {
    headers: headersSchema,
    body: {
      description: "Signup request body",
      content: {
        "application/json": {
          schema: authSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Signup user",
      content: {
        "application/json": {
          schema: authResponseSchema,
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

export const signinRoute = createRoute({
  path: "/signin",
  method: "post",
  tags: ["Authorization"],
  request: {
    headers: headersSchema,
    body: {
      description: "Signin request body",
      content: {
        "application/json": {
          schema: authSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Signin user",
      content: {
        "application/json": {
          schema: authResponseSchema,
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

export const sessionRoute = createRoute({
  path: "/session",
  method: "get",
  tags: ["Authorization"],
  responses: {
    200: {
      description: "Session user",
      content: {
        "application/json": {
          schema: authResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: unauthorizedErrorSchema,
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

export const signoutRoute = createRoute({
  path: "/signout",
  method: "post",
  tags: ["Authorization"],
  request: {
    headers: headersSchema,
  },
  responses: {
    200: {
      description: "Signout authenticated user",
      content: {
        "application/json": {
          schema: successSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: unauthorizedErrorSchema,
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

export const csrfRoute = createRoute({
  path: "/csrf",
  method: "get",
  tags: ["Authorization"],
  responses: {
    200: {
      description: "Csrf token",
      content: {
        "application/json": {
          schema: csrfTokenResponseSchema,
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
