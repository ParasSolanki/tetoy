import { Context } from "hono";
import type { ContextEnv } from "../types.js";

interface RequestError {
  message?: string;
}

type Errors = {
  [x: string]: string[] | undefined;
  [x: number]: string[] | undefined;
  [x: symbol]: string[] | undefined;
};

interface BadRequestError extends RequestError {
  errors?: Errors;
}

export function badRequestError(
  c: Context<ContextEnv>,
  error?: BadRequestError
) {
  return c.json(
    {
      ok: false,
      code: "BAD_REQUEST",
      message: error?.message ?? "Wrong data passed",
      errors: error?.errors,
    },
    400
  );
}

export function unauthorizedError(
  c: Context<ContextEnv>,
  error?: RequestError
) {
  return c.json(
    {
      ok: false,
      code: "UNAUTHORIZED",
      message: error?.message ?? "Not authorized",
    },
    401
  );
}

export function forbiddenError(c: Context<ContextEnv>, error?: RequestError) {
  return c.json(
    {
      ok: false,
      code: "FORBIDDEN",
      message: error?.message ?? "Forbidden",
    },
    403
  );
}

export function conflictError(
  c: Context<ContextEnv>,
  error: { message: string }
) {
  return c.json(
    {
      ok: false,
      code: "CONFLICT",
      message: error.message,
    },
    409
  );
}

export function internalServerError(
  c: Context<ContextEnv>,
  error?: RequestError
) {
  return c.json(
    {
      ok: false,
      code: "INTERNAL_SERVER_ERROR",
      message: error?.message ?? "Something went wrong",
    },
    500
  );
}
