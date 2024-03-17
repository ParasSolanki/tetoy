import { and, desc, eq, isNull, like, sql } from "@tetoy/db/drizzle";
import {
  createStorageRoute,
  getPaginatedStoragesRoute,
} from "../openapi/storages.openapi.js";
import { createProtectedOpenApiHono } from "../utils/openapi-hono.js";
import {
  categoriesTable,
  db,
  productsTable,
  storageActivityLogsTable,
  storageBlocksTable,
  storagesTable,
  subCategoriesTable,
  usersTable,
} from "@tetoy/db";
import { badRequestError, internalServerError } from "../utils/response.js";
import { getBlocksFromDimension } from "../utils/storage.js";
import pMap from "p-map";

export const route = createProtectedOpenApiHono()
  .openapi(getPaginatedStoragesRoute, async (c) => {
    const { name, page, perPage } = c.req.valid("query");

    try {
      const nameLike = name ? `${name}%` : "%";

      const [storagesResults, totalResults] = await Promise.allSettled([
        db
          .select({
            id: storagesTable.id,
            name: storagesTable.name,
            dimension: storagesTable.dimension,
            capacity: storagesTable.capacity,
            createdAt: storagesTable.createdAt,
            superVisor: {
              id: usersTable.id,
              displayName: usersTable.displayName,
              avatarUrl: usersTable.avatarUrl,
            },
            product: {
              id: productsTable.id,
              name: productsTable.name,
              category: sql`
                case 
                    when count(${productsTable.categoryId}) = 0 then NULL
                    else json_object('id', ${categoriesTable.id}, 'name', ${categoriesTable.name})
                end
              `
                .mapWith(String)
                .as("category"),
              subCategory: sql`
                case 
                    when count(${productsTable.subCategoryId}) = 0 then NULL
                    else json_object('id', ${subCategoriesTable.id}, 'name', ${subCategoriesTable.name})
                end
              `
                .mapWith(String)
                .as("sub_category"),
            },
          })
          .from(storagesTable)
          .innerJoin(usersTable, eq(usersTable.id, storagesTable.supervisorId))
          .innerJoin(
            productsTable,
            eq(productsTable.id, storagesTable.productId)
          )
          .innerJoin(
            categoriesTable,
            eq(categoriesTable.id, productsTable.categoryId)
          )
          .innerJoin(
            subCategoriesTable,
            eq(subCategoriesTable.id, productsTable.subCategoryId)
          )
          .where(
            and(
              isNull(storagesTable.deletedAt),
              like(storagesTable.name, nameLike)
            )
          )
          .orderBy(desc(storagesTable.createdAt))
          .offset((page - 1) * perPage)
          .limit(perPage),
        db
          .select({
            total: sql`count(*)`.mapWith(Number).as("total"),
          })
          .from(storagesTable)
          .where(
            and(
              isNull(storagesTable.deletedAt),
              like(storagesTable.name, nameLike)
            )
          ),
      ]);

      if (
        storagesResults.status === "rejected" ||
        totalResults.status === "rejected"
      ) {
        throw new Error("Something went wrong");
      }

      return c.json(
        {
          ok: true,
          data: {
            storages: storagesResults.value.map((s) => ({
              ...s,
              product: {
                ...s.product,
                category: JSON.parse(s.product.category),
                subCategory: JSON.parse(s.product.subCategory),
              },
            })),
            pagination: {
              page,
              perPage,
              total: Math.ceil(totalResults.value[0].total / perPage),
            },
          },
        },
        200
      );
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(createStorageRoute, async (c) => {
    const body = c.req.valid("json");

    try {
      const [productRes, superVisorRes, storageRes] = await Promise.all([
        db
          .select({ id: productsTable.id })
          .from(productsTable)
          .where(
            and(
              isNull(productsTable.deletedAt),
              eq(productsTable.id, body.productId)
            )
          ),
        db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.id, body.superVisorId)),
        db
          .select({ id: storagesTable.id })
          .from(storagesTable)
          .where(
            and(
              isNull(storagesTable.deletedAt),
              like(storagesTable.name, body.name)
            )
          ),
      ]);

      const product = productRes[0];
      const superVisor = superVisorRes[0];
      const storage = storageRes[0];

      if (!product) {
        return badRequestError(c, { message: "Product does not exists" });
      }
      if (!superVisor) {
        return badRequestError(c, { message: "Super visor does not exists" });
      }

      if (storage) {
        return badRequestError(c, {
          message: "Storage with name already exists",
        });
      }
    } catch (e) {
      return internalServerError(c);
    }

    try {
      const authUser = c.get("user");
      const storage = await db.transaction(async (tx) => {
        const [storage] = await tx
          .insert(storagesTable)
          .values({
            name: body.name,
            dimension: body.dimension,
            capacity: body.capacity,
            productId: body.productId,
            createdById: authUser.id,
            supervisorId: body.superVisorId,
          })
          .returning({
            id: storagesTable.id,
            name: storagesTable.name,
            dimension: storagesTable.dimension,
            capacity: storagesTable.capacity,
            createdAt: storagesTable.createdAt,
            createdById: storagesTable.createdById,
            productId: storagesTable.productId,
            superVisorId: storagesTable.supervisorId,
          });

        const blocks = getBlocksFromDimension(body.dimension);

        await pMap(
          blocks,
          async (block) => {
            await tx.insert(storageBlocksTable).values({
              name: block.name,
              row: block.row,
              column: block.column,
              storageId: storage.id,
            });
          },
          { concurrency: 6 }
        );

        await tx.insert(storageActivityLogsTable).values({
          action: "CREATE",
          storageId: storage.id,
          userId: authUser.id,
          message: `Created new storage '${storage.name}' with dimension '${storage.dimension}' and '${storage.capacity}' capacity.`,
        });

        return storage;
      });

      return c.json(
        {
          ok: true,
          data: { storage },
        },
        201
      );
    } catch (e) {
      console.log(e);
      return internalServerError(c);
    }
  });