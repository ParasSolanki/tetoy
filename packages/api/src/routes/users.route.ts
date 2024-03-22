import { db, usersTable } from "@tetoy/db";
import { getAllUsersRoute } from "../openapi/users.openapi.js";
import { createProtectedOpenApiHono } from "../utils/openapi-hono.js";
import { badRequestError, internalServerError } from "../utils/response.js";
import { and, desc, like, lt } from "@tetoy/db/drizzle";

export const route = createProtectedOpenApiHono().openapi(
  getAllUsersRoute,
  async (c) => {
    const query = c.req.valid("query");

    if (query.cursor && isNaN(new Date(query.cursor).getTime())) {
      return badRequestError(c, { message: "Invalid cursor" });
    }

    try {
      const cursor = query.cursor ? new Date(query.cursor) : new Date();

      const users = await db
        .select({
          id: usersTable.id,
          displayName: usersTable.displayName,
          createdAt: usersTable.createdAt,
        })
        .from(usersTable)
        .where(
          and(
            like(usersTable.displayName, query.name ? `${query.name}%` : "%"),
            lt(usersTable.createdAt, cursor)
          )
        )
        .orderBy(desc(usersTable.createdAt))
        .groupBy(usersTable.id)
        .limit(20);

      return c.json(
        {
          ok: true,
          data: {
            users,
            cursor: users.at(-1)?.createdAt.getTime(),
          },
        },
        200
      );
    } catch (e) {
      return internalServerError(c);
    }
  }
);
