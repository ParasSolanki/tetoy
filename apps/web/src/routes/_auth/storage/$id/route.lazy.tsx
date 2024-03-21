import { useQuery } from "@tanstack/react-query";
import {
  createLazyFileRoute,
  Link,
  Outlet,
  useChildMatches,
} from "@tanstack/react-router";
import { storagesQuries } from "~/common/keys/storage";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Route as StorageIdRoute } from "./route";

export const Route = createLazyFileRoute("/_auth/storage/$id")({
  component: StorageDetailsPage,
});

function StorageDetailsPage() {
  const storageId = StorageIdRoute.useParams({ select: (p) => p.id });
  const { isLoading, data } = useQuery(storagesQuries.details(storageId));
  const matches = useChildMatches();

  const defaultValue =
    matches[0].routeId === "/_auth/storage/$id/activity"
      ? "activity"
      : "manage";

  return (
    <Tabs defaultValue={defaultValue}>
      <div className="flex items-center justify-between">
        {isLoading && !data && <Skeleton className="h-6 w-[250px]" />}
        {!isLoading && data && data.data.storage.name && (
          <h1 className="text-4xl font-black">{data.data.storage.name}</h1>
        )}
        <div className="flex items-center space-x-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage" asChild>
              <Link to="/storage/$id/" params={{ id: storageId }}>
                Manage
              </Link>
            </TabsTrigger>
            <TabsTrigger value="activity" asChild>
              <Link to="/storage/$id/activity" params={{ id: storageId }}>
                Activity
              </Link>
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      <TabsContent value="manage" className="mt-6 space-y-4">
        <Outlet />
      </TabsContent>
      <TabsContent value="activity" className="mt-6 space-y-4">
        <Outlet />
      </TabsContent>
    </Tabs>
  );
}
