import { queryOptions } from "@tanstack/react-query";
import {
  paginatedProductsResponseSchema,
  paginatedProductsSearchSchema,
} from "@tetoy/api/schema";
import { api } from "~/utils/api-client";
import { z } from "zod";

export const productsKeys = {
  all: ["products"] as const,
  list: (values: z.infer<typeof paginatedProductsSearchSchema>) =>
    [...productsKeys.all, "list", values] as const,
};

export const productsQuries = {
  list: (values: z.infer<typeof paginatedProductsSearchSchema>) =>
    queryOptions({
      staleTime: 60 * 1000,
      queryKey: productsKeys.list(values),
      queryFn: async () => {
        const searchParams = new URLSearchParams();

        searchParams.set("page", values.page.toString());
        searchParams.set("perPage", values.perPage.toString());

        if (values.name) searchParams.set("name", values.name);

        const res = api.get("products", {
          searchParams,
        });

        return paginatedProductsResponseSchema.parse(await res.json());
      },
      placeholderData: (data) => data,
    }),
};
