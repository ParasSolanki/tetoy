import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  getAllProductsResponseSchema,
  getAllProductsSearchSchema,
  paginatedProductsResponseSchema,
  paginatedProductsSearchSchema,
} from "@tetoy/api/schema";
import { api } from "~/utils/api-client";
import { z } from "zod";

export const productsSearchSchema = z.object({
  name: paginatedProductsSearchSchema.shape.name,
  page: paginatedProductsSearchSchema.shape.page.catch(1),
  perPage: paginatedProductsSearchSchema.shape.perPage.catch(20),
});

export const productsKeys = {
  all: ["products"] as const,
  list: (values: z.infer<typeof productsSearchSchema>) =>
    [...productsKeys.all, "list", values] as const,
  infinite: (values: z.infer<typeof getAllProductsSearchSchema>) =>
    [...productsKeys.all, "infinite", values] as const,
};

export const productsQuries = {
  list: (values: z.infer<typeof productsSearchSchema>) =>
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
  infinite: (values: z.infer<typeof getAllProductsSearchSchema>) =>
    infiniteQueryOptions({
      queryKey: productsKeys.infinite(values),
      queryFn: async ({ pageParam }) => {
        const searchParams = new URLSearchParams();

        if (values.name) searchParams.set("name", values.name);
        if (pageParam) searchParams.set("cursor", pageParam.toString());

        const res = await api.get("products/all", {
          searchParams,
        });

        return getAllProductsResponseSchema.parse(await res.json());
      },
      initialPageParam: 0,
      getPreviousPageParam: (firstPage) => firstPage.data.cursor ?? undefined,
      getNextPageParam: (lastPage) => lastPage.data.cursor ?? undefined,
    }),
};
