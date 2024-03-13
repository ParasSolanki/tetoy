import { db, usersTable } from "@tetoy/db";
import { eq } from "@tetoy/db/drizzle";
import { updateMeDisplayNameRoute } from "../openapi/me.openapi.js";
import { createProtectedOpenApiHono } from "../utils/openapi-hono.js";
import { internalServerError } from "../utils/response.js";

export const route = createProtectedOpenApiHono().openapi(
  updateMeDisplayNameRoute,
  async (c) => {
    const { displayName } = c.req.valid("json");

    try {
      const authUser = c.get("user");
      await db
        .update(usersTable)
        .set({
          displayName,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, authUser.id));

      return c.json(
        {
          ok: true,
        },
        200
      );
    } catch (e) {
      return internalServerError(c);
    }
  }
);
