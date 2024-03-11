import { z } from "zod";
import { successSchema } from "./schema";

export const paginatedProductsSearchSchema = z.object({
  name: z.string().optional(),
  page: z.coerce.number(z.string()).default(1),
  perPage: z.coerce.number(z.string()).default(20),
});

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  category: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  subCategory: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
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
});

export const paginatedProductsResponseSchema = successSchema.extend({
  data: z.object({
    products: productSchema.array(),
    pagination: z.object({
      page: z.number(),
      perPage: z.number(),
      total: z.number(),
    }),
  }),
});

export const getAllProductsSearchSchema = z.object({
  name: z.string().optional(),
  cursor: z.coerce.number(z.string()).optional(),
});

export const getAllProductsResponseSchema = successSchema.extend({
  data: z.object({
    products: z
      .object({
        id: z.string(),
        name: z.string(),
        createdAt: z.string(),
        category: z
          .object({
            id: z.string(),
            name: z.string(),
          })
          .nullable(),
        subCategory: z
          .object({
            id: z.string(),
            name: z.string(),
          })
          .nullable(),
      })
      .array(),
    cursor: z.number().optional(),
  }),
});

export const createProductSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(100, "Name can at most contain 100 character(s)"),
  categoryId: z.string({ required_error: "Category id is requied" }),
  subCategoryId: z.string({ required_error: "Sub category id is requied" }),
});

export const createProductResponseSchema = successSchema.extend({
  data: z.object({
    product: z.object({
      id: z.string(),
      name: z.string(),
      categoryId: z.string(),
      subCategoryId: z.string(),
      createdById: z.string(),
      createdAt: z.string(),
    }),
  }),
});

export const getProductResponseSchema = successSchema.extend({
  data: z.object({
    product: productSchema,
  }),
});

export const updateProductSchema = createProductSchema;

export const updateProductResponseSchema = successSchema.extend({
  data: z.object({
    product: z.object({
      id: z.string(),
      name: z.string(),
      categoryId: z.string(),
      subCategoryId: z.string(),
      createdById: z.string(),
      updatedById: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string().nullable(),
    }),
  }),
});

export const deleteProductResponseSchema = successSchema;
