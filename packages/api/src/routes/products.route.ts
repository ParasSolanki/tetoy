import {
  categoriesTable,
  db,
  productsTable,
  subCategoriesTable,
  usersTable,
} from "@tetoy/db";
import {
  aliasedTable,
  and,
  desc,
  eq,
  isNull,
  like,
  lt,
  sql,
} from "@tetoy/db/drizzle";
import {
  createProductRoute,
  deleteProductRoute,
  getAllProductsRoute,
  getPaginatedProductsRoute,
  getProductRoute,
  updateProductRoute,
} from "../openapi/products.openapi.js";
import { createProtectedOpenApiHono } from "../utils/openapi-hono.js";
import {
  badRequestError,
  conflictError,
  internalServerError,
} from "../utils/response.js";

export const route = createProtectedOpenApiHono()
  .openapi(getPaginatedProductsRoute, async (c) => {
    const { page, perPage, name } = c.req.valid("query");

    try {
      const createdUsers = aliasedTable(usersTable, "created_users");
      const updatedUsers = aliasedTable(usersTable, "updated_users");

      const nameLike = name ? `${name}%` : "%";

      const [products, total] = await Promise.all([
        db
          .select({
            id: productsTable.id,
            name: productsTable.name,
            createdAt: productsTable.createdAt,
            updatedAt: productsTable.updatedAt,
            category: {
              id: categoriesTable.id,
              name: categoriesTable.name,
            },
            subCategory: {
              id: subCategoriesTable.id,
              name: subCategoriesTable.name,
            },
            createdBy: {
              id: createdUsers.id,
              displayName: createdUsers.displayName,
            },
            updatedBy: {
              id: updatedUsers.id,
              displayName: updatedUsers.displayName,
            },
          })
          .from(productsTable)
          .leftJoin(
            categoriesTable,
            and(
              eq(categoriesTable.id, productsTable.categoryId),
              isNull(categoriesTable.deletedAt)
            )
          )
          .leftJoin(
            subCategoriesTable,
            and(
              eq(subCategoriesTable.id, productsTable.subCategoryId),
              isNull(subCategoriesTable.deletedAt)
            )
          )
          .leftJoin(
            createdUsers,
            eq(createdUsers.id, productsTable.createdById)
          )
          .leftJoin(
            updatedUsers,
            eq(updatedUsers.id, productsTable.updatedById)
          )
          .where(
            and(
              isNull(productsTable.deletedAt),
              like(productsTable.name, nameLike)
            )
          )
          .orderBy(desc(productsTable.createdAt))
          .offset((page - 1) * perPage)
          .limit(perPage),
        db
          .select({
            total: sql`count(*)`.mapWith(Number).as("total"),
          })
          .from(productsTable)
          .where(
            and(
              isNull(productsTable.deletedAt),
              like(productsTable.name, nameLike)
            )
          ),
      ]);

      return c.json(
        {
          ok: true,
          data: {
            products,
            pagination: {
              page,
              perPage,
              total: total[0].total,
            },
          },
        },
        200
      );
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(getAllProductsRoute, async (c) => {
    const query = c.req.valid("query");

    if (query.cursor && isNaN(new Date(query.cursor).getTime())) {
      return badRequestError(c, { message: "Invalid cursor" });
    }

    try {
      const cursor = query.cursor ? new Date(query.cursor) : new Date();

      const products = await db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          createdAt: productsTable.createdAt,
          category: {
            id: categoriesTable.id,
            name: categoriesTable.name,
          },
          subCategory: {
            id: subCategoriesTable.id,
            name: subCategoriesTable.name,
          },
        })
        .from(productsTable)
        .leftJoin(
          categoriesTable,
          and(
            eq(categoriesTable.id, productsTable.categoryId),
            isNull(categoriesTable.deletedAt)
          )
        )
        .leftJoin(
          subCategoriesTable,
          and(
            eq(subCategoriesTable.id, productsTable.subCategoryId),
            isNull(subCategoriesTable.deletedAt)
          )
        )
        .where(
          and(
            isNull(productsTable.deletedAt),
            like(productsTable.name, query.name ? `${query.name}%` : "%"),
            lt(productsTable.createdAt, cursor)
          )
        )
        .orderBy(desc(productsTable.createdAt))
        .limit(20);

      return c.json(
        {
          ok: true,
          data: {
            products,
            cursor: products.at(-1)?.createdAt.getTime(),
          },
        },
        200
      );
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(createProductRoute, async (c) => {
    const body = c.req.valid("json");

    try {
      const [categoryRes, subCategoryRes, productRes] = await Promise.all([
        db
          .select({ id: categoriesTable.id })
          .from(categoriesTable)
          .where(
            and(
              isNull(categoriesTable.deletedAt),
              eq(categoriesTable.id, body.categoryId)
            )
          ),
        db
          .select({ id: subCategoriesTable.id })
          .from(subCategoriesTable)
          .where(
            and(
              isNull(subCategoriesTable.deletedAt),
              eq(subCategoriesTable.id, body.subCategoryId),
              eq(subCategoriesTable.categoryId, body.categoryId)
            )
          ),
        db
          .select({ id: productsTable.id })
          .from(productsTable)
          .where(
            and(
              isNull(productsTable.deletedAt),
              eq(productsTable.name, body.name)
            )
          )
          .limit(1),
      ]);

      const category = categoryRes[0];
      const subCategory = subCategoryRes[0];
      const product = productRes[0];

      if (!category) {
        return badRequestError(c, { message: "Category does not exists" });
      }
      if (!subCategory) {
        return badRequestError(c, { message: "Sub category does not exists" });
      }
      if (product) {
        return conflictError(c, {
          message: "Product with name already exists",
        });
      }
    } catch (e) {
      return internalServerError(c);
    }

    try {
      const authUser = c.get("user");
      const [product] = await db
        .insert(productsTable)
        .values({
          name: body.name,
          categoryId: body.categoryId,
          subCategoryId: body.subCategoryId,
          createdById: authUser.id,
        })
        .returning({
          id: productsTable.id,
          name: productsTable.name,
          categoryId: productsTable.categoryId,
          subCategoryId: productsTable.subCategoryId,
          createdById: productsTable.createdById,
          createdAt: productsTable.createdAt,
        });

      return c.json({ ok: true, data: { product } }, 201);
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(getProductRoute, async (c) => {
    const param = c.req.valid("param");

    try {
      const [product] = await db
        .select({ id: productsTable.id })
        .from(productsTable)
        .where(
          and(isNull(productsTable.deletedAt), eq(productsTable.id, param.id))
        )
        .limit(1);

      if (!product) {
        return badRequestError(c, { message: "Product does not exists" });
      }
    } catch (e) {
      return internalServerError(c);
    }

    try {
      const createdUsers = aliasedTable(usersTable, "created_users");
      const updatedUsers = aliasedTable(usersTable, "updated_users");

      const [product] = await db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
          category: {
            id: categoriesTable.id,
            name: categoriesTable.name,
          },
          subCategory: {
            id: subCategoriesTable.id,
            name: subCategoriesTable.name,
          },
          createdBy: {
            id: createdUsers.id,
            displayName: createdUsers.displayName,
          },
          updatedBy: {
            id: updatedUsers.id,
            displayName: updatedUsers.displayName,
          },
        })
        .from(productsTable)
        .leftJoin(
          categoriesTable,
          and(
            eq(categoriesTable.id, productsTable.categoryId),
            isNull(categoriesTable.deletedAt)
          )
        )
        .leftJoin(
          subCategoriesTable,
          and(
            eq(subCategoriesTable.id, productsTable.subCategoryId),
            isNull(subCategoriesTable.deletedAt)
          )
        )
        .leftJoin(createdUsers, eq(createdUsers.id, productsTable.createdById))
        .leftJoin(updatedUsers, eq(updatedUsers.id, productsTable.updatedById))
        .where(
          and(eq(productsTable.id, param.id), isNull(productsTable.deletedAt))
        );

      return c.json({ ok: true, data: { product } }, 200);
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(updateProductRoute, async (c) => {
    const param = c.req.valid("param");
    const body = c.req.valid("json");

    try {
      const [categoryRes, subCategoryRes, productRes] = await Promise.all([
        db
          .select({ id: categoriesTable.id })
          .from(categoriesTable)
          .where(
            and(
              isNull(categoriesTable.deletedAt),
              eq(categoriesTable.id, body.categoryId)
            )
          ),
        db
          .select({ id: subCategoriesTable.id })
          .from(subCategoriesTable)
          .where(
            and(
              isNull(subCategoriesTable.deletedAt),
              eq(subCategoriesTable.id, body.subCategoryId),
              eq(subCategoriesTable.categoryId, body.categoryId)
            )
          ),
        db
          .select({ id: productsTable.id })
          .from(productsTable)
          .where(
            and(
              isNull(productsTable.deletedAt),
              eq(productsTable.name, body.name)
            )
          )
          .limit(1),
      ]);

      const category = categoryRes[0];
      const subCategory = subCategoryRes[0];
      const product = productRes[0];

      if (!category) {
        return badRequestError(c, { message: "Category does not exists" });
      }
      if (!subCategory) {
        return badRequestError(c, { message: "Sub category does not exists" });
      }
      if (product) {
        return conflictError(c, {
          message: "Product with name already exists",
        });
      }
    } catch (e) {
      return internalServerError(c);
    }

    try {
      const authUser = c.get("user");
      const date = new Date();
      const [product] = await db
        .update(productsTable)
        .set({
          name: body.name,
          categoryId: body.categoryId,
          subCategoryId: body.subCategoryId,
          updatedById: authUser.id,
          updatedAt: date,
        })
        .where(eq(productsTable.id, param.id))
        .returning({
          id: productsTable.id,
          name: productsTable.name,
          categoryId: productsTable.categoryId,
          subCategoryId: productsTable.subCategoryId,
          createdById: productsTable.createdById,
          updatedById: productsTable.updatedById,
          createdAt: productsTable.createdAt,
          updatedAt: productsTable.updatedAt,
        });

      return c.json({ ok: true, data: { product } }, 200);
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(deleteProductRoute, async (c) => {
    const param = c.req.valid("param");

    try {
      const [product] = await db
        .select({ id: productsTable.id })
        .from(productsTable)
        .where(
          and(isNull(productsTable.deletedAt), eq(productsTable.id, param.id))
        )
        .limit(1);

      if (!product) {
        return badRequestError(c, { message: "Product does not exists" });
      }

      const date = new Date();
      const authUser = c.get("user");
      await db
        .update(productsTable)
        .set({
          updatedById: authUser.id,
          updatedAt: date,
          deletedAt: date,
        })
        .where(eq(productsTable.id, param.id));

      return c.json({ ok: true }, 200);
    } catch (e) {
      return internalServerError(c);
    }
  });
