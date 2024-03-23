import {
  aliasedTable,
  and,
  desc,
  eq,
  inArray,
  isNull,
  like,
  lt,
  countDistinct,
  sql,
} from "@tetoy/db/drizzle";
import {
  createStorageBoxRoute,
  createStorageRoute,
  deleteStorageRoute,
  getPaginatedStoragesRoute,
  getStorageLogsRoute,
  getStorageRoute,
  paginatedStorageBlockBoxesRoute,
} from "../openapi/storages.openapi.js";
import { createProtectedOpenApiHono } from "../utils/openapi-hono.js";
import {
  categoriesTable,
  countriesTable,
  db,
  productsTable,
  storageActivityLogsTable,
  storageBlocksTable,
  storageBoxesCountriesTable,
  storageBoxesTable,
  storagesTable,
  subCategoriesTable,
  usersTable,
} from "@tetoy/db";
import {
  badRequestError,
  conflictError,
  internalServerError,
} from "../utils/response.js";
import { getBlocksFromDimension } from "../utils/storage.js";
import pMap from "p-map";
import { z } from "zod";

const STORAGE_ACTIONS = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  RESIZE: "RESIZE",
  ADD_BOX: "ADD_BOX",
  UPDATE_BOX: "UPDATE_BOX",
  DELETE_BOX: "DELETE_BOX",
  CHECKOUT_BOX: "CHECKOUT_BOX",
};

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
                    when ${productsTable.categoryId} is NULL then NULL
                    else json_object('id', ${categoriesTable.id}, 'name', ${categoriesTable.name})
                end
              `
                .mapWith(String)
                .as("category"),
              subCategory: sql`
                case 
                    when ${productsTable.subCategoryId} is NULL then NULL
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
        return conflictError(c, {
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
  })
  .openapi(getStorageRoute, async (c) => {
    const param = c.req.valid("param");

    try {
      const [storage] = await db
        .select({ id: storagesTable.id })
        .from(storagesTable)
        .where(
          and(eq(storagesTable.id, param.id), isNull(storagesTable.deletedAt))
        );

      if (!storage) {
        return badRequestError(c, { message: "Storage does not exists" });
      }
    } catch (e) {
      return internalServerError(c);
    }

    try {
      const createdUsers = aliasedTable(usersTable, "created_users");
      const superVisorUsers = aliasedTable(usersTable, "supervisor_users");

      const [storage] = await db
        .select({
          id: storagesTable.id,
          name: storagesTable.name,
          dimension: storagesTable.dimension,
          capacity: storagesTable.capacity,
          createdAt: storagesTable.createdAt,
          createdBy: {
            id: createdUsers.id,
            displayName: createdUsers.displayName,
            avatarUrl: createdUsers.avatarUrl,
          },
          superVisor: {
            id: superVisorUsers.id,
            displayName: superVisorUsers.displayName,
            avatarUrl: superVisorUsers.avatarUrl,
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
          blocks: sql`
          case
            when count(${storageBlocksTable.id}) = 0 then json('[]')
            else json_group_array(
                    json_object('id', ${storageBlocksTable.id}, 'name', ${storageBlocksTable.name}, 'row', ${storageBlocksTable.row}, 'column', ${storageBlocksTable.column})
                  )
          end`
            .mapWith(String)
            .as("blocks"),
        })
        .from(storagesTable)
        .innerJoin(createdUsers, eq(createdUsers.id, storagesTable.createdById))
        .innerJoin(productsTable, eq(productsTable.id, storagesTable.productId))
        .innerJoin(
          superVisorUsers,
          eq(superVisorUsers.id, storagesTable.supervisorId)
        )
        .innerJoin(
          categoriesTable,
          eq(categoriesTable.id, productsTable.categoryId)
        )
        .innerJoin(
          subCategoriesTable,
          eq(subCategoriesTable.id, productsTable.subCategoryId)
        )
        .innerJoin(
          storageBlocksTable,
          eq(storageBlocksTable.storageId, storagesTable.id)
        )
        .where(
          and(isNull(storagesTable.deletedAt), eq(storagesTable.id, param.id))
        )
        .groupBy(storagesTable.id);

      return c.json(
        {
          ok: true,
          data: {
            storage: {
              ...storage,
              product: {
                ...storage.product,
                category: JSON.parse(storage.product.category),
                subCategory: JSON.parse(storage.product.subCategory),
              },
              blocks: JSON.parse(storage.blocks),
            },
          },
        },
        200
      );
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(deleteStorageRoute, async (c) => {
    const param = c.req.valid("param");

    try {
      const [storage] = await db
        .select({ id: storagesTable.id })
        .from(storagesTable)
        .where(
          and(eq(storagesTable.id, param.id), isNull(storagesTable.deletedAt))
        );

      if (!storage) {
        return badRequestError(c, { message: "Storage does not exists" });
      }
    } catch (e) {
      return internalServerError(c);
    }

    try {
      const authUser = c.get("user");
      const date = new Date(); // deleted or updated date

      await db.transaction(async (tx) => {
        const [storage] = await tx
          .select({
            id: storagesTable.id,
            name: storagesTable.name,
            blocks: sql`
            case
              when count(${storageBlocksTable.id}) = 0 then json('[]')
              else json_group_array(${storageBlocksTable.id})
            end`
              .mapWith(String)
              .as("blocks"),
          })
          .from(storagesTable)
          .innerJoin(
            storageBlocksTable,
            eq(storageBlocksTable.storageId, storagesTable.id)
          )
          .where(eq(storagesTable.id, param.id))
          .groupBy(storagesTable.id);

        await tx
          .update(storagesTable)
          .set({
            deletedAt: date,
            updatedAt: date,
            updatedById: authUser.id,
          })
          .where(eq(storagesTable.id, param.id));

        await tx
          .update(storageBlocksTable)
          .set({
            deletedAt: date,
            updatedAt: date,
          })
          .where(eq(storageBlocksTable.storageId, param.id));

        const blockIds = z.string().array().parse(JSON.parse(storage.blocks));

        if (blockIds.length) {
          await tx
            .update(storageBoxesTable)
            .set({
              deletedAt: date,
              updatedAt: date,
            })
            .where(inArray(storageBoxesTable.blockId, blockIds));
        }

        await tx.insert(storageActivityLogsTable).values({
          action: "DELETE",
          message: `Deleted storage '${storage.name}'.`,
          timestamp: date,
          userId: authUser.id,
          storageId: storage.id,
        });
      });

      return c.json({ ok: true }, 200);
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(getStorageLogsRoute, async (c) => {
    const param = c.req.valid("param");
    const query = c.req.valid("query");

    if (query.cursor && isNaN(new Date(query.cursor).getTime())) {
      return badRequestError(c, { message: "Invalid cursor" });
    }

    try {
      const [storage] = await db
        .select({ id: storagesTable.id })
        .from(storagesTable)
        .where(
          and(eq(storagesTable.id, param.id), isNull(storagesTable.deletedAt))
        );

      if (!storage) {
        return badRequestError(c, { message: "Storage does not exists" });
      }
    } catch (e) {
      return internalServerError(c);
    }

    try {
      const cursor = query.cursor ? new Date(query.cursor) : new Date();

      const logs = await db
        .select({
          id: storageActivityLogsTable.id,
          action: storageActivityLogsTable.action,
          message: storageActivityLogsTable.message,
          timestamp: storageActivityLogsTable.timestamp,
          user: {
            id: usersTable.id,
            displayName: usersTable.displayName,
            avatarUrl: usersTable.avatarUrl,
          },
        })
        .from(storageActivityLogsTable)
        .innerJoin(
          usersTable,
          eq(usersTable.id, storageActivityLogsTable.userId)
        )
        .where(
          and(
            eq(storageActivityLogsTable.storageId, param.id),
            lt(storageActivityLogsTable.timestamp, cursor)
          )
        )
        .orderBy(desc(storageActivityLogsTable.timestamp))
        .limit(20);

      return c.json(
        {
          ok: true,
          data: { logs, cursor: logs.at(-1)?.timestamp.getTime() },
        },
        200
      );
    } catch (e) {
      return internalServerError(c);
    }
  })
  .openapi(paginatedStorageBlockBoxesRoute, async (c) => {
    const params = c.req.valid("param");

    try {
      const [storages, blocks] = await Promise.all([
        db
          .select({ id: storagesTable.id })
          .from(storagesTable)
          .where(
            and(
              eq(storagesTable.id, params.id),
              isNull(storagesTable.deletedAt)
            )
          ),
        db
          .select({ id: storageBlocksTable.id })
          .from(storageBlocksTable)
          .where(
            and(
              eq(storageBlocksTable.storageId, params.id),
              eq(storageBlocksTable.id, params.blockId),
              isNull(storageBlocksTable.deletedAt)
            )
          ),
      ]);

      const storage = storages[0];
      const block = blocks[0];

      if (!storage) {
        return badRequestError(c, { message: "Storage does not exists" });
      }
      if (!block) {
        return badRequestError(c, { message: "Storage block does not exists" });
      }
    } catch (e) {
      return internalServerError(c);
    }

    const { name, page, perPage } = c.req.valid("query");

    try {
      const nameLike = name ? `${name}%` : "%";

      const [boxesResults, totalResults] = await Promise.allSettled([
        db
          .select({
            id: storageBoxesTable.id,
            grade: storageBoxesTable.grade,
            price: storageBoxesTable.price,
            weight: storageBoxesTable.weight,
            subGrade: storageBoxesTable.subGrade,
            totalBoxes: storageBoxesTable.totalBoxes,
            checkedOutBoxes: storageBoxesTable.checkedOutBoxes,
            product: {
              id: productsTable.id,
              name: productsTable.name,
            },
            user: {
              id: usersTable.id,
              displayName: usersTable.displayName,
            },
          })
          .from(storageBoxesTable)
          .innerJoin(usersTable, eq(usersTable.id, storageBoxesTable.userId))
          .innerJoin(
            productsTable,
            eq(productsTable.id, storageBoxesTable.productId)
          )
          .where(
            and(
              isNull(storageBoxesTable.checkedOutAt),
              isNull(storageBoxesTable.deletedAt),
              like(productsTable.name, nameLike)
            )
          )
          .orderBy(desc(storageBoxesTable.createdAt))
          .offset((page - 1) * perPage)
          .limit(perPage),
        db
          .select({
            total: sql`count(*)`.mapWith(Number).as("total"),
          })
          .from(storageBoxesTable)
          .innerJoin(
            productsTable,
            eq(productsTable.id, storageBoxesTable.productId)
          )
          .where(
            and(
              isNull(storageBoxesTable.checkedOutAt),
              isNull(storageBoxesTable.deletedAt),
              like(productsTable.name, nameLike)
            )
          ),
      ]);

      if (
        boxesResults.status === "rejected" ||
        totalResults.status === "rejected"
      ) {
        throw new Error("Something went wrong");
      }

      return c.json(
        {
          ok: true,
          data: {
            boxes: boxesResults.value,
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
  .openapi(createStorageBoxRoute, async (c) => {
    const params = c.req.valid("param");
    const body = c.req.valid("json");

    const { error, data } = await checkDoesExistsInDB({
      storageId: params.id,
      blockId: params.blockId,
      userId: body.userId,
      countryIds: body.countries,
      productId: body.productId,
    });

    if (error || !data) {
      return internalServerError(c);
    }

    const { storage, product, block, user, countriesExists } = data;

    if (!storage) {
      return badRequestError(c, { message: "Storage does not exists" });
    }
    if (!block) {
      return badRequestError(c, { message: "Storage block does not exists" });
    }
    if (!product) {
      return badRequestError(c, { message: "Product does not exists" });
    }
    if (!user) {
      return badRequestError(c, { message: "User does not exists" });
    }
    if (!countriesExists) {
      return badRequestError(c, { message: "Invalid countries" });
    }

    try {
      const authUser = c.get("user");

      const box = await db.transaction(async (tx) => {
        const [box] = await tx
          .insert(storageBoxesTable)
          .values({
            productId: body.productId,
            userId: body.userId,
            blockId: params.blockId,
            grade: body.grade,
            price: body.price,
            totalBoxes: body.totalBoxes,
            weight: body.weight,
            subGrade: body.subGrade,
          })
          .returning({
            id: storageBoxesTable.id,
            productId: storageBoxesTable.productId,
            userId: storageBoxesTable.userId,
            blockId: storageBoxesTable.blockId,
            grade: storageBoxesTable.grade,
            price: storageBoxesTable.price,
            totalBoxes: storageBoxesTable.totalBoxes,
            weight: storageBoxesTable.weight,
            subGrade: storageBoxesTable.subGrade,
          });

        await pMap(
          body.countries,
          async (countryId) => {
            await tx
              .insert(storageBoxesCountriesTable)
              .values({ boxId: box.id, countryId });
          },
          { concurrency: 6 }
        );

        const message = `Added ${box.totalBoxes > 1 ? `a set of ${box.totalBoxes}` : `a`} '${product.name}' (priced at ${box.price}) to block '${block.name}'.`;

        await tx.insert(storageActivityLogsTable).values({
          message,
          action: STORAGE_ACTIONS.ADD_BOX,
          storageId: params.id,
          userId: authUser.id,
        });

        return box;
      });

      return c.json(
        {
          ok: true,
          data: { box },
        },
        201
      );
    } catch (e) {
      return internalServerError(c);
    }
  });

type CheckDoesExistsInDBProps = {
  storageId: string;
  blockId: string;
  productId: string;
  userId: string;
  countryIds: string[];
};

async function checkDoesExistsInDB({
  storageId,
  blockId,
  productId,
  userId,
  countryIds,
}: CheckDoesExistsInDBProps) {
  try {
    const countriesSQ = db
      .select({ count: countDistinct(countriesTable.id).as("total_distinct") })
      .from(countriesTable)
      .where(inArray(countriesTable.id, countryIds))
      .as("countries_subquery");

    const [storages, blocks, products, users, countries] = await Promise.all([
      db
        .select({ id: storagesTable.id })
        .from(storagesTable)
        .where(
          and(eq(storagesTable.id, storageId), isNull(storagesTable.deletedAt))
        ), // check storage exists
      db
        .select({ id: storageBlocksTable.id, name: storageBlocksTable.name })
        .from(storageBlocksTable)
        .where(
          and(
            eq(storageBlocksTable.storageId, storageId),
            eq(storageBlocksTable.id, blockId),
            isNull(storageBlocksTable.deletedAt)
          )
        ), // check storage block exists
      db
        .select({ id: productsTable.id, name: productsTable.name })
        .from(productsTable)
        .where(
          and(eq(productsTable.id, productId), isNull(productsTable.deletedAt))
        ), // check product exists
      db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, userId)), // check user exists
      db
        .select({
          allExists: sql`
            case
              when "total_distinct" = ${countryIds.length} then 1
              else 0
            end
          `
            .mapWith(Boolean)
            .as("all_exists"),
        })
        .from(countriesSQ), // check all provided country exists
    ]);

    return {
      data: {
        user: users[0],
        block: blocks[0],
        storage: storages[0],
        product: products[0],
        countriesExists: countries[0].allExists,
      },
      error: undefined,
    };
  } catch (e) {
    return { data: undefined, error: e };
  }
}
