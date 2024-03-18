import { createFileRoute } from "@tanstack/react-router";
import { storagesQuries, storagesSearchSchema } from "~/common/keys/storage";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/_auth/storages")({
  validateSearch: storagesSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context: { queryClient }, deps: { search } }) => {
    queryClient.ensureQueryData(
      storagesQuries.list({
        name: search.name,
        page: search.page,
        perPage: search.perPage,
      }),
    );
  },
  meta: () => {
    return seo({
      title: "Storages | Tetoy",
      description: "List of storages in tetoy",
    });
  },
});
