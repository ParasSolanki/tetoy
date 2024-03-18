import { queryOptions } from "@tanstack/react-query";
import {
  getStorageResponseSchema,
  paginatedStoragesResponseSchema,
  paginatedStoragesSearchSchema,
} from "@tetoy/api/schema";
import { api } from "~/utils/api-client";
import { z } from "zod";

export const storagesSearchSchema = z.object({
  name: paginatedStoragesSearchSchema.shape.name,
  page: paginatedStoragesSearchSchema.shape.page.catch(1),
  perPage: paginatedStoragesSearchSchema.shape.perPage.catch(20),
});

export const storageIdSchema = z.string();

export const storagesKeys = {
  all: ["storages"] as const,
  list: (values: z.infer<typeof storagesSearchSchema>) =>
    [...storagesKeys.all, "list", values] as const,
  details: (id: z.infer<typeof storageIdSchema>) =>
    [...storagesKeys.all, "details", { id }] as const,
};

export const storagesQuries = {
  list: (values: z.infer<typeof storagesSearchSchema>) =>
    queryOptions({
      staleTime: 60 * 1000,
      queryKey: storagesKeys.list(values),
      queryFn: async () => {
        const searchParams = new URLSearchParams();

        searchParams.set("page", values.page.toString());
        searchParams.set("perPage", values.perPage.toString());

        if (values.name) searchParams.set("name", values.name);

        const res = api.get("storages", {
          searchParams,
        });

        return paginatedStoragesResponseSchema.parse(await res.json());
      },
      placeholderData: (data) => data,
    }),
  details: (id: z.infer<typeof storageIdSchema>) =>
    queryOptions({
      staleTime: 60 * 1000,
      queryKey: storagesKeys.details(id),
      queryFn: async () => {
        const res = api.get(`storages/${id}`);

        return getStorageResponseSchema.parse(await res.json());
      },
    }),
};
