import { infiniteQueryOptions } from "@tanstack/react-query";
import {
  getAllUsersResponseSchema,
  getAllUsersSearchSchema,
} from "@tetoy/api/schema";
import { api } from "~/utils/api-client";
import { z } from "zod";

export const usersKeys = {
  all: ["users"] as const,
  infinite: (values: z.infer<typeof getAllUsersSearchSchema>) =>
    [...usersKeys.all, "infinite", values] as const,
};

export const usersQuries = {
  infinite: (values: z.infer<typeof getAllUsersSearchSchema>) =>
    infiniteQueryOptions({
      queryKey: usersKeys.infinite(values),
      queryFn: async ({ pageParam }) => {
        const searchParams = new URLSearchParams();

        if (pageParam) searchParams.set("cursor", pageParam.toString());

        const res = await api.get(`users/all`, {
          searchParams,
        });

        return getAllUsersResponseSchema.parse(await res.json());
      },
      initialPageParam: 0,
      getPreviousPageParam: (firstPage) => firstPage.data.cursor ?? undefined,
      getNextPageParam: (lastPage) => lastPage.data.cursor ?? undefined,
    }),
};
