import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  getAllCategoriesResponseSchema,
  getAllCategoriesSearchSchema,
  paginatedCategoriesResponseSchema,
  paginatedCategoriesSearchSchema,
} from "@tetoy/api/schema";
import { api } from "~/utils/api-client";
import { z } from "zod";

export const categoriesSearchSchema = z.object({
  name: paginatedCategoriesSearchSchema.shape.name,
  page: paginatedCategoriesSearchSchema.shape.page.catch(1),
  perPage: paginatedCategoriesSearchSchema.shape.perPage.catch(20),
});

export const categoriesKeys = {
  all: ["categories"] as const,
  list: (values: z.infer<typeof categoriesSearchSchema>) =>
    [...categoriesKeys.all, "list", values] as const,
  infinite: (values: z.infer<typeof getAllCategoriesSearchSchema>) =>
    [...categoriesKeys.all, "infinite", values] as const,
};

export const categoriesQuries = {
  list: (values: z.infer<typeof categoriesSearchSchema>) =>
    queryOptions({
      staleTime: 60 * 1000,
      queryKey: categoriesKeys.list(values),
      queryFn: async () => {
        const searchParams = new URLSearchParams();

        searchParams.set("page", values.page.toString());
        searchParams.set("perPage", values.perPage.toString());

        if (values.name) searchParams.set("name", values.name);

        const res = await api.get("categories", {
          searchParams,
        });

        return paginatedCategoriesResponseSchema.parse(await res.json());
      },
      placeholderData: (data) => data,
    }),
  infinite: (values: z.infer<typeof getAllCategoriesSearchSchema>) =>
    infiniteQueryOptions({
      queryKey: categoriesKeys.infinite(values),
      queryFn: async ({ pageParam }) => {
        const searchParams = new URLSearchParams();

        if (values.name) searchParams.set("name", values.name);
        if (pageParam) searchParams.set("cursor", pageParam.toString());

        const res = await api.get("categories/all", {
          searchParams,
        });

        return getAllCategoriesResponseSchema.parse(await res.json());
      },
      initialPageParam: 0,
      getPreviousPageParam: (firstPage) => firstPage.data.cursor ?? undefined,
      getNextPageParam: (lastPage) => lastPage.data.cursor ?? undefined,
    }),
};
