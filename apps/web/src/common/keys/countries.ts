import { queryOptions } from "@tanstack/react-query";
import { getCountriesResponseSchema } from "@tetoy/api/schema";
import { api } from "~/utils/api-client";

export const countriesKeys = {
  all: ["countries"] as const,
  list: () => [...countriesKeys.all, "list"] as const,
};

export const countriesQuries = {
  list: () =>
    queryOptions({
      staleTime: 60 * 1000,
      queryKey: countriesKeys.list(),
      queryFn: async () => {
        const res = await api.get("countries");

        return getCountriesResponseSchema.parse(await res.json());
      },
      placeholderData: (data) => data,
    }),
};
