import { db, userKeysTable, userPasswordsTable, usersTable } from "@tetoy/db";
import { and, eq } from "@tetoy/db/drizzle";
import { getCookie } from "hono/cookie";
import { Argon2id } from "oslo/password";
import { PROVIDER_KEYS } from "../constants/provider.js";
import { env } from "../env.js";
import { lucia } from "../lib/lucia.js";
import {
  csrfRoute,
  sessionRoute,
  signinRoute,
  signoutRoute,
  signupRoute,
} from "../openapi/auth.openapi.js";
import { createCsrfToken, validateCsrfToken } from "../utils/csrf-token.js";
import { createOpenApiHono } from "../utils/openapi-hono.js";
import {
  badRequestError,
  conflictError,
  forbiddenError,
  internalServerError,
  unauthorizedError,
} from "../utils/response.js";

export const route = createOpenApiHono()
  .openapi(signupRoute, async (c) => {
    const headers = c.req.valid("header");
    const isValid = validateCsrfToken(
      headers["x-csrf-token"],
      env.TOKEN_SECRET
    );

    if (!isValid) return forbiddenError(c);

    const sessionCookie = getCookie(c, lucia.sessionCookieName);

    if (sessionCookie) {
      const { session } = await lucia.validateSession(sessionCookie);

      if (session) return forbiddenError(c);
    }

    const { email, password } = c.req.valid("json");

    try {
      const [user] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (user) {
        return conflictError(c, { message: "User already exists with email" });
      }
    } catch (e) {
      return internalServerError(c);
    }

    try {
      const user = await db.transaction(async (tx) => {
        const [user] = await tx
          .insert(usersTable)
          .values({
            email,
          })
          .returning();

        const hashedPassword = await new Argon2id().hash(password);

        await tx.insert(userPasswordsTable).values({
          hashedPassword,
          userId: user.id,
        });

        await tx.insert(userKeysTable).values({
          providerId: PROVIDER_KEYS.EMAIL,
          providerUserId: email,
          userId: user.id,
        });

        return user;
      });

      const session = await lucia.createSession(user.id, {});

      const sessionCookie = lucia.createSessionCookie(session.id).serialize();

      c.header("Set-Cookie", sessionCookie);

      return c.json(
        {
          ok: true,
          data: { user: { ...user, provider: PROVIDER_KEYS.EMAIL } },
        },
        201
      );
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(signinRoute, async (c) => {
    const headers = c.req.valid("header");
    const isValid = validateCsrfToken(
      headers["x-csrf-token"],
      env.TOKEN_SECRET
    );

    if (!isValid) return forbiddenError(c);

    const sessionCookie = getCookie(c, lucia.sessionCookieName);

    if (sessionCookie) {
      const { session } = await lucia.validateSession(sessionCookie);

      if (session) return forbiddenError(c);
    }

    const { email, password } = c.req.valid("json");

    try {
      const [usersData, keysData] = await Promise.all([
        db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1),
        db
          .select({
            userId: userKeysTable.userId,
          })
          .from(userKeysTable)
          .where(
            and(
              eq(userKeysTable.providerId, PROVIDER_KEYS.EMAIL),
              eq(userKeysTable.providerUserId, email)
            )
          )
          .limit(1),
      ]);

      const user = usersData[0];
      const key = keysData[0];

      if (!user || !key) {
        return badRequestError(c, { message: "Incorrect email or password" });
      }
    } catch (e) {
      return internalServerError(c);
    }

    try {
      const [user] = await db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          displayName: usersTable.displayName,
          avatarUrl: usersTable.avatarUrl,
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
          hashedPassword: userPasswordsTable.hashedPassword,
        })
        .from(usersTable)
        .leftJoin(
          userPasswordsTable,
          eq(usersTable.id, userPasswordsTable.userId)
        )
        .where(eq(usersTable.email, email))
        .limit(1);

      // no user found
      if (!user) {
        return badRequestError(c, { message: "Incorrect email or password" });
      }

      const { hashedPassword, ...userWithoutPassword } = user;

      // user does not have password
      if (!hashedPassword) {
        return badRequestError(c, { message: "Incorrect email or password" });
      }

      const isPasswordValid = await new Argon2id().verify(
        hashedPassword,
        password
      );

      if (!isPasswordValid) {
        return badRequestError(c, { message: "Incorrect email or password" });
      }

      const session = await lucia.createSession(userWithoutPassword.id, {});

      const sessionCookie = lucia.createSessionCookie(session.id).serialize();

      c.header("Set-Cookie", sessionCookie);

      return c.json(
        {
          ok: true,
          data: {
            user: { ...userWithoutPassword, provider: PROVIDER_KEYS.EMAIL },
          },
        },
        200
      );
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(sessionRoute, async (c) => {
    const sessionCookie = getCookie(c, lucia.sessionCookieName);

    if (!sessionCookie) return unauthorizedError(c);

    try {
      const { session, user: sessionUser } =
        await lucia.validateSession(sessionCookie);

      if (!session || !sessionUser) {
        return unauthorizedError(c);
      }

      if (session.fresh) {
        const newSessionCookie = lucia
          .createSessionCookie(session.id)
          .serialize();
        c.header("Set-Cookie", newSessionCookie);
      }

      const [user] = await db.select().from(usersTable);

      return c.json(
        {
          ok: true,
          data: {
            user: {
              ...user,
              provider: "email",
            },
          },
        },
        200
      );
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(signoutRoute, async (c) => {
    const headers = c.req.valid("header");
    const isValid = validateCsrfToken(
      headers["x-csrf-token"],
      env.TOKEN_SECRET
    );

    if (!isValid) return forbiddenError(c);

    const sessionCookie = getCookie(c, lucia.sessionCookieName);

    if (!sessionCookie) return unauthorizedError(c);

    try {
      const { session } = await lucia.validateSession(sessionCookie);

      if (!session) return unauthorizedError(c);

      await lucia.invalidateSession(session.id);

      c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize());

      return c.json(
        {
          ok: true,
        },
        200
      );
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(csrfRoute, async (c) => {
    const csrfToken = createCsrfToken(env.TOKEN_SECRET);

    return c.json({
      ok: true,
      data: {
        csrfToken,
      },
    });
  });
