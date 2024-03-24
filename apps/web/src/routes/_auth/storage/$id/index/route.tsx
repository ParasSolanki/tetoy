import { createFileRoute } from "@tanstack/react-router";
import {
  storageBoxesSearchSchema,
  storagesQuries,
} from "~/common/keys/storage";
import { z } from "zod";

const searchSchema = storageBoxesSearchSchema.extend({
  block: z.string().optional(),
});

export const Route = createFileRoute("/_auth/storage/$id/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context: { queryClient }, params, deps: { search } }) => {
    if (search.block) {
      queryClient.ensureQueryData(
        storagesQuries.boxesList(params.id, search.block, {
          name: search.name,
          page: search.page,
          perPage: search.perPage,
        }),
      );
    }
  },
});
