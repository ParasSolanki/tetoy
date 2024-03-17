import { sql } from "drizzle-orm";
import {
  text,
  sqliteTable,
  integer,
  unique,
  real,
} from "drizzle-orm/sqlite-core";
import { createId } from "@paralleldrive/cuid2";

export const usersTable = sqliteTable("users", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email", { length: 255 }).notNull().unique(),
  displayName: text("display_name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const userSessionsTable = sqliteTable("user_session", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const userPasswordsTable = sqliteTable("user_password", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  hashedPassword: text("hashed_password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const userKeysTable = sqliteTable(
  "user_keys",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    providerId: text("provider_key").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(
      sql`(strftime('%s', 'now'))`
    ),
  },
  (t) => ({
    uniqueUserIdAndProviderId: unique().on(t.userId, t.providerId),
  })
);

export const countriesTable = sqliteTable("countries", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export const categoriesTable = sqliteTable("categories", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  createdById: text("created_by_id")
    .notNull()
    .references(() => usersTable.id),
  updatedById: text("updated_by_id").references(() => usersTable.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const subCategoriesTable = sqliteTable("sub_categories", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categoriesTable.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const productsTable = sqliteTable("products", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categoriesTable.id),
  subCategoryId: text("sub_category_id")
    .notNull()
    .references(() => subCategoriesTable.id),
  createdById: text("created_by_id")
    .notNull()
    .references(() => usersTable.id),
  updatedById: text("updated_by_id").references(() => usersTable.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const storagesTable = sqliteTable("storages", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  dimension: text("dimension").notNull(),
  capacity: text("capacity").notNull(),
  productId: text("product_id")
    .notNull()
    .references(() => productsTable.id),
  supervisorId: text("supervisor_id")
    .notNull()
    .references(() => usersTable.id),
  createdById: text("created_by_id")
    .notNull()
    .references(() => usersTable.id),
  updatedById: text("updated_by_id").references(() => usersTable.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const storageActivityLogsTable = sqliteTable("storage_activity_logs", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  action: text("action"),
  message: text("message"),
  storageId: text("storage_id")
    .notNull()
    .references(() => storagesTable.id),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const storageBlocksTable = sqliteTable("storage_blocks", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull(),
  storageId: text("storage_id")
    .notNull()
    .references(() => storagesTable.id, { onDelete: "cascade" }),
  row: integer("row"),
  column: integer("column"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const storageBoxesTable = sqliteTable("storage_boxes", {
  id: text("id")
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  storageId: text("storage_id")
    .notNull()
    .references(() => storagesTable.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => productsTable.id),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  totalBoxes: integer("total_boxes").notNull(),
  checkedOutBoxes: integer("checked_out_boxes").notNull().default(0),
  grade: text("grade").notNull(),
  price: real("price").notNull(),
  weight: real("weight").notNull(),
  subGrade: text("sub_grade"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  checkedOutAt: integer("checked_out_at", { mode: "timestamp" }),
});

export const storageBoxesCountriesTable = sqliteTable(
  "storage_boxes_countries",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    boxId: text("box_id")
      .notNull()
      .references(() => storageBoxesTable.id, { onDelete: "cascade" }),
    countriesTable: text("country_id")
      .notNull()
      .references(() => countriesTable.id),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
  }
);
