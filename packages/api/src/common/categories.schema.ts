import { z } from "zod";
import { successSchema } from "./schema.js";

export const paginatedCategoriesSearchSchema = z.object({
  name: z.string().optional(),
  page: z.coerce.number(z.string()).default(1),
  perPage: z.coerce.number(z.string()).default(20),
});

export const paginatedCategoriesResponseSchema = successSchema.extend({
  data: z.object({
    categories: z
      .object({
        id: z.string(),
        name: z.string(),
        createdAt: z.string(),
        updatedAt: z.string().nullable(),
        createdBy: z
          .object({
            id: z.string(),
            displayName: z.string().nullable(),
          })
          .nullable(),
        updatedBy: z
          .object({
            id: z.string(),
            displayName: z.string().nullable(),
          })
          .nullable(),
        subCategories: z
          .object({
            id: z.string(),
            name: z.string(),
          })
          .array(),
      })
      .array(),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
    }),
  }),
});

export const getAllCategoriesSearchSchema = z.object({
  name: z.string().optional(),
  cursor: z.coerce.number(z.string()).optional(),
});

export const getAllCategoriesResponseSchema = successSchema.extend({
  data: z.object({
    categories: z
      .object({
        id: z.string(),
        name: z.string(),
        createdAt: z.string(),
        subCategories: z
          .object({
            id: z.string(),
            name: z.string(),
          })
          .array(),
      })
      .array(),
    cursor: z.number().optional(),
  }),
});

const subCategoriesSchema = z.object({
  name: z
    .string({ required_error: "Sub category name is required" })
    .min(1, "Sub category name is required")
    .max(100, "Sub category name can at most contain 100 character(s)"),
});

const categoryBaseSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(100, "Name can at most contain 100 character(s)"),
});

export const createCategorySchema = categoryBaseSchema.extend({
  subCategories: subCategoriesSchema
    .array()
    .min(1, "Sub category must contain at least 1 element(s)"),
});

export const createCategoryResponseSchema = successSchema.extend({
  data: z.object({
    category: z.object({
      id: z.string(),
      name: z.string(),
      createdById: z.string(),
      updatedById: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string().nullable(),
    }),
  }),
});

export const getCategoryResponseSchema = successSchema.extend({
  data: z.object({
    category: z.object({
      id: z.string(),
      name: z.string(),
      createdAt: z.string(),
      updatedAt: z.string().nullable(),
      createdBy: z
        .object({
          id: z.string(),
          displayName: z.string().nullable(),
        })
        .nullable(),
      updatedBy: z
        .object({
          id: z.string(),
          displayName: z.string().nullable(),
        })
        .nullable(),
      subCategories: z
        .object({
          id: z.string(),
          name: z.string(),
        })
        .array(),
    }),
  }),
});

export const updateCategorySchema = categoryBaseSchema.extend({
  subCategories: subCategoriesSchema
    .extend({
      id: z.string().optional(),
    })
    .array(),
});

export const updateCategoryResponseSchema = successSchema.extend({
  data: z.object({
    category: z.object({
      id: z.string(),
      name: z.string(),
      createdById: z.string(),
      updatedById: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string().nullable(),
    }),
  }),
});

export const deleteCatgoryResponseSchema = successSchema;
