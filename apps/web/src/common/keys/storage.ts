import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  getStorageLogsResponseSchema,
  getStorageLogsSearchSchema,
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

export const storageBlockSchema = getStorageResponseSchema.shape.data
  .pick({
    storage: true,
  })
  .shape.storage.pick({ blocks: true }).shape.blocks;

export const storageIdSchema = z.string();

type StorageLogValues = { id: z.infer<typeof storageIdSchema> } & z.infer<
  typeof getStorageLogsSearchSchema
>;

export const storagesKeys = {
  all: ["storages"] as const,
  list: (values: z.infer<typeof storagesSearchSchema>) =>
    [...storagesKeys.all, "list", values] as const,
  details: (id: z.infer<typeof storageIdSchema>) =>
    [...storagesKeys.all, "details", { id }] as const,
  logs: (values: StorageLogValues) =>
    [...storagesKeys.all, "logs", values] as const,
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

        const res = await api.get("storages", {
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
        const res = await api.get(`storages/${id}`);

        return getStorageResponseSchema.parse(await res.json());
      },
    }),
  logs: (values: StorageLogValues) =>
    infiniteQueryOptions({
      queryKey: storagesKeys.logs(values),
      queryFn: async ({ pageParam }) => {
        const searchParams = new URLSearchParams();

        if (pageParam) searchParams.set("cursor", pageParam.toString());

        const res = await api.get(`storages/${values.id}/logs`, {
          searchParams,
        });

        return getStorageLogsResponseSchema.parse(await res.json());
      },
      initialPageParam: 0,
      getPreviousPageParam: (firstPage) => firstPage.data.cursor ?? undefined,
      getNextPageParam: (lastPage) => lastPage.data.cursor ?? undefined,
    }),
};
