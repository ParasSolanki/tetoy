import { sql } from "drizzle-orm";
import { text, sqliteTable, integer, unique } from "drizzle-orm/sqlite-core";
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
