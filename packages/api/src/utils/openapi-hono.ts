import { OpenAPIHono } from "@hono/zod-openapi";
import { getCookie } from "hono/cookie";
import { lucia } from "../lib/lucia.js";
import { cors } from "hono/cors";
import { env } from "../env.js";
import { createMiddleware } from "hono/factory";
import { verifyRequestOrigin } from "oslo/request";
import { badRequestError, forbiddenError } from "./response.js";
import { ContextEnv } from "../types.js";

export function createOpenApiHono() {
  const app = new OpenAPIHono<ContextEnv>({
    defaultHook: (result, c) => {
      if (!result.success) {
        return badRequestError(c, {
          errors: result.error.flatten().fieldErrors,
        });
      }
    },
  });

  app.use(
    "*",
    cors({
      origin: env.ALLOWED_ORIGIN,
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  );
  app.use(
    "/api",
    csrf({
      origin: [env.ALLOWED_ORIGIN],
    })
  );

  return app;
}

export function createProtectedOpenApiHono() {
  const app = createOpenApiHono();

  app.use("*", auth());

  return app;
}

function csrf({ origin }: { origin: string[] }) {
  return createMiddleware(async (c, next) => {
    const reqOrigin = c.req.header("origin");

    if (!reqOrigin) return forbiddenError(c);

    if (!verifyRequestOrigin(new URL(reqOrigin).origin, origin)) {
      return forbiddenError(c);
    }

    await next();
  });
}

function auth() {
  return createMiddleware(async (c, next) => {
    const sessionCookie = getCookie(c, lucia.sessionCookieName);

    if (!sessionCookie) return forbiddenError(c);

    const { session, user } = await lucia.validateSession(sessionCookie);

    if (!session) return forbiddenError(c);

    if (session.fresh) {
      const newSessionCookie = lucia
        .createSessionCookie(session.id)
        .serialize();

      c.header("Set-Cookie", newSessionCookie);
    }

    c.set("user", user);

    await next();
  });
}
