import { createFileRoute } from "@tanstack/react-router";
import { storagesQuries } from "~/common/keys/storage";
import { Skeleton } from "~/components/ui/skeleton";

export const Route = createFileRoute("/_auth/storage/$id/activity")({
  loader: ({ context: { queryClient }, params }) => {
    queryClient.prefetchInfiniteQuery(storagesQuries.logs({ id: params.id }));
  },
  pendingComponent: StorageDetailActivitySkeleton,
  wrapInSuspense: true,
});

function StorageDetailActivitySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-80" />
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-6 w-60" />
    </div>
  );
}
