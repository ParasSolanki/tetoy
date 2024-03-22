import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { createStorageResponseSchema } from "@tetoy/api/schema";
import { storagesKeys } from "~/common/keys/storage";
import { StorageForm } from "~/components/storage-form";
import type { Storage } from "~/components/storage-form";
import { StoragesTable } from "~/components/storages-table";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { api } from "~/utils/api-client";
import { HTTPError } from "ky";
import * as React from "react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/_auth/storages")({
  component: StoragesPage,
});

function StoragesPage() {
  return (
    <div className="pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black">Storages</h1>

        <div className="flex items-center space-x-3">
          <AddStorageDialog />
        </div>
      </div>
      <StoragesTable />
    </div>
  );
}

function AddStorageDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const { isPending, mutate } = useMutation({
    mutationKey: ["storages", "add"],
    mutationFn: async (values: Storage) => {
      const res = await api.post("storages", { json: values });

      return createStorageResponseSchema.parse(await res.json());
    },
    onSuccess: () => {
      toast.success("Storage added successfully");
      queryClient.invalidateQueries({ queryKey: storagesKeys.all });
    },
    onError: async (error) => {
      if (error instanceof HTTPError) {
        const data = await error.response.json();
        if (data.message) toast.error(data.message);
      } else {
        toast.error("Something went wrong while addding storage");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Storage</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Storage</DialogTitle>
          <DialogDescription>
            Add Storage details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <StorageForm
          isPending={isPending}
          onSubmit={(values) =>
            mutate(values, {
              onSuccess: () => {
                setOpen(false);
              },
            })
          }
        />
      </DialogContent>
    </Dialog>
  );
}
