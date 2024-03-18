import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { storagesQuries } from "~/common/keys/storage";
import { Route as StorageIdRoute } from "./route";

export const Route = createLazyFileRoute("/_auth/storage/$id")({
  component: StorageDetailsPage,
});

function StorageDetailsPage() {
  const storageId = StorageIdRoute.useParams({ select: (p) => p.id });
  const { isLoading, data } = useQuery(storagesQuries.details(storageId));

  if (isLoading) return "loading...";

  if (!data) return "no data";

  const storage = data.data.storage;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black">{storage.name}</h1>

        <div className="flex items-center space-x-3"></div>
      </div>
    </div>
  );
}
