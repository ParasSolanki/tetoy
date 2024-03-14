import { categoriesTable, db, subCategoriesTable, usersTable } from "@tetoy/db";
import {
  aliasedTable,
  and,
  desc,
  eq,
  isNull,
  like,
  lt,
  not,
  sql,
} from "@tetoy/db/drizzle";
import {
  createCategoryRoute,
  deleteCategoryRoute,
  getAllCategoriesRoute,
  getCategoryRoute,
  getPaginatedCategoriesRoute,
  updateCategoryRoute,
} from "../openapi/categories.openapi.js";
import { createProtectedOpenApiHono } from "../utils/openapi-hono.js";
import {
  badRequestError,
  conflictError,
  internalServerError,
} from "../utils/response.js";

export const route = createProtectedOpenApiHono()
  .openapi(getPaginatedCategoriesRoute, async (c) => {
    const { page, perPage, name } = c.req.valid("query");

    try {
      const createdUsers = aliasedTable(usersTable, "created_users");
      const updatedUsers = aliasedTable(usersTable, "updated_users");

      const nameLike = name ? `${name}%` : "%";

      const [categoriesResults, totalResults] = await Promise.allSettled([
        db
          .select({
            id: categoriesTable.id,
            name: categoriesTable.name,
            createdAt: categoriesTable.createdAt,
            updatedAt: categoriesTable.updatedAt,
            createdBy: {
              id: createdUsers.id,
              displayName: createdUsers.displayName,
            },
            updatedBy: {
              id: updatedUsers.id,
              displayName: updatedUsers.displayName,
            },
            subCategories: sql`
              case
                when count(${subCategoriesTable.id}) = 0 then json('[]')
                else json_group_array(
                        json_object('id', ${subCategoriesTable.id}, 'name', ${subCategoriesTable.name})
                      )
              end`
              .mapWith(String)
              .as("sub_categories"),
          })
          .from(categoriesTable)
          .leftJoin(
            createdUsers,
            eq(createdUsers.id, categoriesTable.createdById)
          )
          .leftJoin(
            updatedUsers,
            eq(updatedUsers.id, categoriesTable.updatedById)
          )
          .leftJoin(
            subCategoriesTable,
            and(
              eq(subCategoriesTable.categoryId, categoriesTable.id),
              isNull(subCategoriesTable.deletedAt)
            )
          )
          .where(
            and(
              isNull(categoriesTable.deletedAt),
              like(categoriesTable.name, nameLike)
            )
          )
          .orderBy(desc(categoriesTable.createdAt))
          .groupBy(categoriesTable.id)
          .offset((page - 1) * perPage)
          .limit(perPage),
        db
          .select({
            total: sql`count(*)`.mapWith(Number).as("total"),
          })
          .from(categoriesTable)
          .where(
            and(
              isNull(categoriesTable.deletedAt),
              like(categoriesTable.name, nameLike)
            )
          ),
      ]);

      if (
        categoriesResults.status === "rejected" ||
        totalResults.status === "rejected"
      ) {
        throw new Error("Something went wrong");
      }

      return c.json(
        {
          ok: true,
          data: {
            categories: categoriesResults.value.map((c) => ({
              ...c,
              subCategories: JSON.parse(c.subCategories),
            })),
            pagination: {
              total: totalResults.value[0].total,
              page,
              perPage,
            },
          },
        },
        200
      );
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(getAllCategoriesRoute, async (c) => {
    const query = c.req.valid("query");

    if (query.cursor && isNaN(new Date(query.cursor).getTime())) {
      return badRequestError(c, { message: "Invalid cursor" });
    }

    try {
      const cursor = query.cursor ? new Date(query.cursor) : new Date();

      const categories = await db
        .select({
          id: categoriesTable.id,
          name: categoriesTable.name,
          createdAt: categoriesTable.createdAt,
          subCategories: sql`
          case
            when count(${subCategoriesTable.id}) = 0 then json('[]')
            else json_group_array(
                    json_object('id', ${subCategoriesTable.id}, 'name', ${subCategoriesTable.name})
                  )
          end`
            .mapWith(String)
            .as("sub_categories"),
        })
        .from(categoriesTable)
        .innerJoin(
          subCategoriesTable,
          and(
            eq(subCategoriesTable.categoryId, categoriesTable.id),
            isNull(subCategoriesTable.deletedAt)
          )
        )
        .where(
          and(
            isNull(categoriesTable.deletedAt),
            like(categoriesTable.name, query.name ? `${query.name}%` : "%"),
            lt(categoriesTable.createdAt, cursor)
          )
        )
        .orderBy(desc(categoriesTable.createdAt))
        .groupBy(categoriesTable.id)
        .limit(20);

      return c.json(
        {
          ok: true,
          data: {
            categories: categories.map((c) => ({
              ...c,
              subCategories: JSON.parse(c.subCategories),
            })),
            cursor: categories.at(-1)?.createdAt.getTime(),
          },
        },
        200
      );
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(createCategoryRoute, async (c) => {
    const body = c.req.valid("json");

    const uniqueSubCategories = new Set(
      body.subCategories.map((c) => c.name.toLowerCase())
    );

    if (uniqueSubCategories.size !== body.subCategories.length) {
      return badRequestError(c, {
        errors: {
          subCategories: ["Each sub category should have unique name"],
        },
      });
    }

    try {
      const [cate] = await db
        .select({ id: categoriesTable.id })
        .from(categoriesTable)
        .where(eq(categoriesTable.name, body.name))
        .limit(1);

      if (cate) {
        return conflictError(c, {
          message: "Category with name already exists",
        });
      }

      const category = await db.transaction(async (tx) => {
        const authUser = c.get("user");

        const [category] = await tx
          .insert(categoriesTable)
          .values({
            name: body.name,
            createdById: authUser.id,
          })
          .returning();

        await Promise.all(
          body.subCategories.map((s) =>
            tx.insert(subCategoriesTable).values({
              categoryId: category.id,
              name: s.name,
            })
          )
        );

        return {
          id: category.id,
          name: category.name,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          createdById: category.createdById,
          updatedById: category.updatedById,
        };
      });

      return c.json(
        {
          ok: true,
          data: {
            category,
          },
        },
        201
      );
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(getCategoryRoute, async (c) => {
    const params = c.req.valid("param");

    try {
      const [category] = await db
        .select({
          id: categoriesTable.id,
        })
        .from(categoriesTable)
        .where(
          and(
            isNull(categoriesTable.deletedAt),
            eq(categoriesTable.id, params.id)
          )
        )
        .limit(1);

      if (!category) {
        return badRequestError(c, { message: "Category does not exists" });
      }
    } catch (e) {
      return internalServerError(c);
    }

    try {
      const createdByUsers = aliasedTable(usersTable, "created_by_users");
      const updatedByUsers = aliasedTable(usersTable, "updated_by_users");

      const result = await db
        .select({
          id: categoriesTable.id,
          name: categoriesTable.name,
          createdAt: categoriesTable.createdAt,
          updatedAt: categoriesTable.updatedAt,
          createdBy: {
            id: createdByUsers.id,
            displayName: createdByUsers.displayName,
          },
          updatedBy: {
            id: updatedByUsers.id,
            displayName: updatedByUsers.displayName,
          },
          subCategories: sql`
          case
            when count(${subCategoriesTable.id}) = 0 then json('[]')
            else json_group_array(
                    json_object('id', ${subCategoriesTable.id}, 'name', ${subCategoriesTable.name})
                  )
          end`
            .mapWith(String)
            .as("sub_categories"),
        })
        .from(categoriesTable)
        .leftJoin(
          createdByUsers,
          eq(createdByUsers.id, categoriesTable.createdById)
        )
        .leftJoin(
          updatedByUsers,
          eq(updatedByUsers.id, categoriesTable.updatedById)
        )
        .leftJoin(
          subCategoriesTable,
          and(
            eq(subCategoriesTable.categoryId, categoriesTable.id),
            isNull(subCategoriesTable.deletedAt)
          )
        )
        .where(
          and(
            isNull(categoriesTable.deletedAt),
            eq(categoriesTable.id, params.id)
          )
        );

      return c.json({
        ok: true,
        data: {
          category: {
            ...result[0],
            subCategories: JSON.parse(result[0].subCategories) as Array<{
              id: string;
              name: string;
            }>,
          },
        },
      });
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(updateCategoryRoute, async (c) => {
    const param = c.req.valid("param");
    const body = c.req.valid("json");

    const uniqueSubCategories = new Set(
      body.subCategories.map((c) => c.name.toLowerCase())
    );

    if (uniqueSubCategories.size !== body.subCategories.length) {
      return badRequestError(c, {
        errors: {
          subCategories: ["Each sub category should have unique name"],
        },
      });
    }

    try {
      const [category] = await db
        .select({ id: categoriesTable.id })
        .from(categoriesTable)
        .where(eq(categoriesTable.id, param.id))
        .limit(1);

      if (!category) {
        return badRequestError(c, { message: "Category does not exists" });
      }
    } catch (e) {
      return internalServerError(c);
    }

    try {
      const [cate] = await db
        .select({ id: categoriesTable.id })
        .from(categoriesTable)
        .where(
          and(
            eq(categoriesTable.name, body.name),
            not(eq(categoriesTable.id, param.id))
          )
        )
        .limit(1);

      if (cate) {
        return conflictError(c, {
          message: "Category with name already exists",
        });
      }

      const category = await db.transaction(async (tx) => {
        const authUser = c.get("user");

        const subCategories = await tx
          .select({ id: subCategoriesTable.id })
          .from(subCategoriesTable)
          .where(
            and(
              isNull(subCategoriesTable.deletedAt),
              eq(subCategoriesTable.categoryId, param.id)
            )
          );

        const newSubcategories = body.subCategories.filter((c) => !c.id);

        const updatedSubcategories = body.subCategories.filter((c) => c.id);
        const updatedSubcategoryIds = updatedSubcategories.map((c) => c.id);

        const deletedSubCategories = subCategories.filter(
          (c) => !updatedSubcategoryIds.includes(c.id)
        );

        const date = new Date(); // updated_at or deleted_at

        const [category] = await tx
          .update(categoriesTable)
          .set({
            name: body.name,
            updatedById: authUser.id,
            updatedAt: date,
          })
          .where(eq(categoriesTable.id, param.id))
          .returning();

        if (newSubcategories.length) {
          await Promise.all(
            newSubcategories.map((s) =>
              tx.insert(subCategoriesTable).values({
                name: s.name,
                categoryId: category.id,
              })
            )
          );
        }

        if (updatedSubcategories.length) {
          // TODO: before updating we should check that updated subcategories with id
          // does exists on DB or not just to verify
          await Promise.all(
            updatedSubcategories.map((s) => {
              return tx
                .update(subCategoriesTable)
                .set({
                  name: s.name,
                  updatedAt: date,
                })
                .where(
                  and(
                    // FIXME: fix s.id type assertion we have to check that every subcategory has id
                    eq(subCategoriesTable.id, s.id!),
                    eq(subCategoriesTable.categoryId, param.id)
                  )
                );
            })
          );
        }

        if (deletedSubCategories.length) {
          await Promise.all(
            deletedSubCategories.map((s) => {
              return tx
                .update(subCategoriesTable)
                .set({
                  deletedAt: date,
                  updatedAt: date,
                })
                .where(
                  and(
                    // FIXME: fix s.id type assertion we have to check that every subcategory has id
                    eq(subCategoriesTable.id, s.id!),
                    eq(subCategoriesTable.categoryId, param.id)
                  )
                );
            })
          );
        }

        return {
          id: category.id,
          name: category.name,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          createdById: category.createdById,
          updatedById: category.updatedById,
        };
      });

      return c.json(
        {
          ok: true,
          data: {
            category,
          },
        },
        200
      );
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(deleteCategoryRoute, async (c) => {
    const param = c.req.valid("param");

    try {
      const [category] = await db
        .select({
          id: categoriesTable.id,
        })
        .from(categoriesTable)
        .where(
          and(
            isNull(categoriesTable.deletedAt),
            eq(categoriesTable.id, param.id)
          )
        )
        .limit(1);

      if (!category) {
        return badRequestError(c, { message: "Category does not exists" });
      }
    } catch (e) {
      return internalServerError(c);
    }

    try {
      const authUser = c.get("user");
      await db.transaction(async (tx) => {
        const date = new Date();
        await tx
          .update(categoriesTable)
          .set({ deletedAt: date, updatedAt: date, updatedById: authUser.id })
          .where(eq(categoriesTable.id, param.id));

        await tx
          .update(subCategoriesTable)
          .set({ deletedAt: date, updatedAt: date })
          .where(
            and(
              isNull(subCategoriesTable.deletedAt),
              eq(subCategoriesTable.categoryId, param.id)
            )
          );
      });

      return c.json(
        {
          ok: true,
        },
        200
      );
    } catch (e) {
      return internalServerError(c);
    }
  });
