import { queryOptions } from "@tanstack/react-query";
import {
  paginatedCategoriesResponseSchema,
  paginatedCategoriesSearchSchema,
} from "@tetoy/api/schema";
import { api } from "~/utils/api-client";
import { z } from "zod";

export const categoriesKeys = {
  all: ["categories"] as const,
  list: (values: z.infer<typeof paginatedCategoriesSearchSchema>) =>
    [...categoriesKeys.all, "list", values] as const,
};

export const categoriesQuries = {
  list: (values: z.infer<typeof paginatedCategoriesSearchSchema>) =>
    queryOptions({
      staleTime: 60 * 1000,
      queryKey: categoriesKeys.list(values),
      queryFn: async () => {
        const searchParams = new URLSearchParams();

        searchParams.set("page", values.page.toString());
        searchParams.set("perPage", values.perPage.toString());

        if (values.name) searchParams.set("name", values.name);

        const res = api.get("categories", {
          searchParams,
        });

        return paginatedCategoriesResponseSchema.parse(await res.json());
      },
      placeholderData: (data) => data,
    }),
};
