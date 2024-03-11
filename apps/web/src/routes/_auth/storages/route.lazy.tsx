import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_auth/storages")({
  component: StoragesPage,
});

function StoragesPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black">Storages</h1>

        <div className="flex items-center space-x-3"></div>
      </div>
    </>
  );
}
