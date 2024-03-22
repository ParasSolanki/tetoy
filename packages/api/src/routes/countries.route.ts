import { countriesTable, db } from "@tetoy/db";
import { createProtectedOpenApiHono } from "../utils/openapi-hono.js";
import { internalServerError } from "../utils/response.js";
import { getCountriesRoute } from "../openapi/countries.openapi.js";

export const route = createProtectedOpenApiHono().openapi(
  getCountriesRoute,
  async (c) => {
    try {
      const countries = await db
        .select({ id: countriesTable.id, name: countriesTable.name })
        .from(countriesTable);

      return c.json({
        ok: true,
        data: {
          countries,
        },
      });
    } catch (e) {
      return internalServerError(c);
    }
  }
);
