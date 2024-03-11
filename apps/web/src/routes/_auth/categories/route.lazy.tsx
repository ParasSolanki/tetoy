import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import {
  createCategoryResponseSchema,
  createCategorySchema,
} from "@tetoy/api/schema";
import { categoriesKeys } from "~/common/keys/categories";
import { CategoriesTable } from "~/components/categories-table";
import { CategoryForm } from "~/components/category-form";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { api } from "~/utils/api-client";
import { HTTPError } from "ky";
import * as React from "react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/_auth/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black">Categories</h1>

        <div className="flex items-center space-x-3">
          <AddCategorySheet />
        </div>
      </div>
      <CategoriesTable />
    </>
  );
}

function AddCategorySheet() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const { isPending, mutate } = useMutation({
    mutationKey: ["categories", "create"],
    mutationFn: async (values: unknown) => {
      const res = api.post("categories", { json: values });

      return createCategoryResponseSchema.parse(await res.json());
    },
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
    },
    onError: async (error) => {
      if (error instanceof HTTPError) {
        const data = await error.response.json();
        if (data.message) toast.error(data.message);
      } else {
        toast.error("Something went wrong while creating category");
      }
    },
  });

  return (
    <Sheet open={open} onOpenChange={(open) => setOpen(open)}>
      <SheetTrigger asChild>
        <Button>Add category</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Category</SheetTitle>
          <SheetDescription>
            Add category details here. Click save when you are done.
          </SheetDescription>
        </SheetHeader>
        <CategoryForm
          schema={createCategorySchema}
          isPending={isPending}
          onSubmit={(values) => {
            mutate(values, {
              onSuccess: () => {
                setOpen(false);
              },
            });
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
