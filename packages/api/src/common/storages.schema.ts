import { z } from "zod";
import { successSchema } from "./schema.js";

export const paginatedStoragesSearchSchema = z.object({
  name: z.string().optional(),
  page: z.coerce
    .number(z.string())
    .min(1, "page must be greater than or equal to 1")
    .default(1),
  perPage: z.coerce
    .number(z.string())
    .min(1, "perPage must be greater than or equal to 1")
    .default(20),
});

export const paginatedStoragesResponseSchema = successSchema.extend({
  data: z.object({
    storages: z
      .object({
        id: z.string(),
        name: z.string(),
        dimension: z.string(),
        capacity: z.string(),
        createdAt: z.string(),
        superVisor: z
          .object({
            id: z.string(),
            displayName: z.string().nullable(),
            avatarUrl: z.string().nullable(),
          })
          .nullable(),
        product: z
          .object({
            id: z.string(),
            name: z.string(),
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
          .nullable(),
      })
      .array(),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
    }),
  }),
});

export const storageDimensionSchema = z.union(
  [
    z.literal("1x1"),
    z.literal("2x2"),
    z.literal("3x3"),
    z.literal("4x4"),
    z.literal("5x5"),
    z.literal("6x6"),
    z.literal("7x7"),
  ],
  {
    errorMap: () => ({
      message: "Dimension must be one of 1x1, 2x2, 3x3, 4x4, 5x5, 6x6 or 7x7",
    }),
  }
);

export const storageDimensionMap = {
  "1x1": {
    row: 1,
    column: 1,
  },
  "2x2": {
    row: 2,
    column: 2,
  },
  "3x3": {
    row: 3,
    column: 3,
  },
  "4x4": {
    row: 4,
    column: 4,
  },
  "5x5": {
    row: 5,
    column: 5,
  },
  "6x6": {
    row: 6,
    column: 6,
  },
  "7x7": {
    row: 7,
    column: 7,
  },
} satisfies Record<
  z.infer<typeof storageDimensionSchema>,
  { row: number; column: number }
>;

export const createStorageSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(50, "Name can at most contain 50 character(s)"),
  productId: z
    .string({ required_error: "Product is required" })
    .min(1, "Product is required"),
  dimension: storageDimensionSchema,
  capacity: z
    .string({ required_error: "Capacity is required" })
    .min(1, "Capacity is required")
    .max(50, "Capacity can at most contain 50 character(s)"),
  superVisorId: z
    .string({ required_error: "Super visor is required" })
    .min(1, "Super visor is required"),
});

export const createStorageResponseSchema = successSchema.extend({
  data: z.object({
    storage: z.object({
      id: z.string(),
      name: z.string(),
      dimension: z.string(),
      capacity: z.string(),
      createdAt: z.string(),
      createdById: z.string(),
      productId: z.string(),
      superVisorId: z.string(),
    }),
  }),
});

export const getStorageResponseSchema = successSchema.extend({
  data: z.object({
    storage: z.object({
      id: z.string(),
      name: z.string(),
      dimension: z.string(),
      capacity: z.string(),
      createdAt: z.string(),
      superVisor: z
        .object({
          id: z.string(),
          displayName: z.string().nullable(),
          avatarUrl: z.string().nullable(),
        })
        .nullable(),
      createdBy: z
        .object({
          id: z.string(),
          displayName: z.string().nullable(),
          avatarUrl: z.string().nullable(),
        })
        .nullable(),
      product: z
        .object({
          id: z.string(),
          name: z.string(),
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
        .nullable(),
      blocks: z
        .object({
          id: z.string(),
          name: z.string(),
          row: z.number(),
          column: z.number(),
        })
        .array(),
    }),
  }),
});

export const deleteStorageResponseSchema = successSchema;

export const getStorageLogsSearchSchema = z.object({
  cursor: z.coerce.number(z.string()).optional(),
});

export const getStorageLogsResponseSchema = successSchema.extend({
  data: z.object({
    logs: z
      .object({
        id: z.string(),
        action: z.string(),
        message: z.string(),
        timestamp: z.string(),
        user: z
          .object({
            id: z.string(),
            displayName: z.string().nullable(),
            avatarUrl: z.string().nullable(),
          })
          .nullable(),
      })
      .array(),
    cursor: z.number().optional(),
  }),
});

export const paginatedStorageBlockBoxesSearchSchema = z.object({
  name: z.string().optional(),
  page: z.coerce
    .number(z.string())
    .min(1, "page must be greater than or equal to 1")
    .default(1),
  perPage: z.coerce
    .number(z.string())
    .min(1, "perPage must be greater than or equal to 1")
    .default(20),
});

export const paginatedStorageBlockBoxesResponseSchema = successSchema.extend({
  data: z.object({
    boxes: z
      .object({
        id: z.string(),
        grade: z.string(),
        price: z.number(),
        weight: z.number(),
        subGrade: z.string().nullable(),
        totalBoxes: z.number(),
        checkedOutBoxes: z.number(),
        createdAt: z.string(),
        block: z
          .object({
            id: z.string(),
            name: z.string(),
          })
          .nullable(),
        user: z
          .object({
            id: z.string(),
            displayName: z.string().nullable(),
          })
          .nullable(),
        product: z
          .object({
            id: z.string(),
            name: z.string(),
          })
          .nullable(),
      })
      .array(),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
    }),
  }),
});

export const createStorageBoxSchema = z.object({
  userId: z.string({ required_error: "User id is required" }),
  productId: z.string({ required_error: "Product id is required" }),
  totalBoxes: z
    .number({ required_error: "Total boxes are required" })
    .min(1, "Total boxes must be greater than or equal to 1"),
  grade: z
    .string({ required_error: "Grade is required" })
    .min(0, "Grade is required")
    .max(50, "Grade can at most contain 50 character(s)"),
  subGrade: z
    .string()
    .max(50, "Sub grade can at most contain 50 character(s)")
    .optional()
    .nullable(),
  weight: z
    .number({ required_error: "Weight is required" })
    .min(0, "Weight must be greater than or equal to 0"),
  price: z
    .number({ required_error: "Price is required" })
    .min(0, "Price must be greater than or equal to 0"),
  countries: z
    .string()
    .array()
    .min(1, "Countries must contain at least 1 element(s)"),
});

export const createStorageBoxResponseSchema = successSchema.extend({
  data: z.object({
    box: z.object({
      id: z.string(),
      blockId: z.string(),
      userId: z.string(),
      productId: z.string(),
      grade: z.string(),
      subGrade: z.string().nullable(),
      weight: z.number(),
      price: z.number(),
      totalBoxes: z.number(),
    }),
  }),
});

export const deleteStorageBoxResponseSchema = successSchema;

export const checkoutStorageBoxSchema = z.object({
  boxes: z
    .number({ required_error: "Boxes are required" })
    .min(1, "Boxes must be greater than or equal to 1"),
});

export const checkoutStorageBoxResponseSchema = successSchema;
