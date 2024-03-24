import { createFileRoute } from "@tanstack/react-router";
import { storagesQuries } from "~/common/keys/storage";

export const Route = createFileRoute("/_auth/storage/$id/activity")({
  loader: ({ context: { queryClient }, params }) => {
    queryClient.prefetchInfiniteQuery(storagesQuries.logs({ id: params.id }));
  },
});
