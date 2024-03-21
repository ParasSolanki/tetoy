import { createFileRoute } from "@tanstack/react-router";
import { storageIdSchema, storagesQuries } from "~/common/keys/storage";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/_auth/storage/$id")({
  parseParams: (params) => ({
    id: storageIdSchema.parse(params.id),
  }),
  loader: ({ context: { queryClient }, params }) => {
    queryClient.ensureQueryData(storagesQuries.details(params.id));
  },
  meta: () => {
    return seo({
      title: "Storages | Tetoy",
      description: "Storage details",
    });
  },
});
