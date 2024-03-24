import { createFileRoute } from "@tanstack/react-router";
import {
  storageBoxesSearchSchema,
  storagesQuries,
} from "~/common/keys/storage";
import { Skeleton } from "~/components/ui/skeleton";
import { z } from "zod";

const searchSchema = storageBoxesSearchSchema.extend({
  block: z.string().optional(),
});

export const Route = createFileRoute("/_auth/storage/$id/")({
  wrapInSuspense: true,
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
  pendingComponent: () => (
    <div className="grid grid-cols-5 grid-rows-5 gap-4">
      {Array.from({ length: 25 }).map((_x, id) => (
        <Skeleton key={id} className="h-10 w-full" />
      ))}
    </div>
  ),
});
