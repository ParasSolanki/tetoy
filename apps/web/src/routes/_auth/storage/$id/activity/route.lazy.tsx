import { useInfiniteQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { storagesQuries } from "~/common/keys/storage";
import { Skeleton } from "~/components/ui/skeleton";
import { format } from "date-fns";
import {
  ActivityIcon,
  BaggageClaimIcon,
  PackagePlusIcon,
  Trash2Icon,
} from "lucide-react";
import { Virtuoso } from "react-virtuoso";
import { Route as StorageIdRoute } from "../route";

export const Route = createLazyFileRoute("/_auth/storage/$id/activity")({
  component: StorageDetailActivityPage,
});

function StorageDetailActivityPage() {
  const storageId = StorageIdRoute.useParams({ select: (p) => p.id });
  const { data, isLoading, fetchNextPage } = useInfiniteQuery(
    storagesQuries.logs({ id: storageId }),
  );

  if (isLoading || !data) return <StorageDetailActivitySkeleton />;

  return (
    <Virtuoso
      style={{ height: "80vh" }}
      data={data.pages}
      endReached={() => fetchNextPage()}
      overscan={200}
      itemContent={(index) => {
        if (data.pages[index].data.logs.length < 1) {
          return <div className="h-2 opacity-0">end</div>;
        }

        return (
          <div className="space-y-8">
            {data.pages[index].data.logs.map((l) => (
              <div key={l.id} className="flex items-start space-x-4">
                <strong className="mt-1.5 flex-shrink-0">
                  {format(new Date(l.timestamp), "PPP")}
                </strong>

                <span className="relative flex size-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground before:absolute before:left-1/2 before:top-full before:h-full before:w-1 before:-translate-x-1/2 before:bg-muted after:absolute after:bottom-full after:left-1/2 after:h-full after:w-1 after:-translate-x-1/2 after:bg-muted md:size-9">
                  {l.action === "CREATE" && (
                    <ActivityIcon className="size-4 md:size-5 " />
                  )}
                  {l.action === "DELETE" && (
                    <Trash2Icon className="size-4 md:size-5 " />
                  )}
                  {l.action === "ADD_BOX" && (
                    <PackagePlusIcon className="size-4 md:size-5 " />
                  )}
                  {l.action === "CHECKOUT_BOX" && (
                    <BaggageClaimIcon className="size-4 md:size-5 " />
                  )}
                </span>

                <div className="text-muted-foreground">
                  <div>
                    <span>{l.message}</span>
                    {l.user?.displayName && (
                      <span>
                        {" "}
                        by <strong>{l.user.displayName}</strong>
                      </span>
                    )}
                  </div>
                  <span>at {format(new Date(l.timestamp), "hh:mm:ss aa")}</span>
                </div>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}

function StorageDetailActivitySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-80" />
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-6 w-60" />
    </div>
  );
}
