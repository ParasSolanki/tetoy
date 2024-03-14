import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { createProductResponseSchema } from "@tetoy/api/schema";
import { productsKeys } from "~/common/keys/products";
import { ProductForm, type Product } from "~/components/product-form";
import { ProductsTable } from "~/components/products-table";
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

export const Route = createLazyFileRoute("/_auth/products")({
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <div className="pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black">Products</h1>

        <div className="flex items-center space-x-3">
          <AddProductDialog />
        </div>
      </div>

      <ProductsTable />
    </div>
  );
}

function AddProductDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const { isPending, mutate } = useMutation({
    mutationKey: ["products", "add"],
    mutationFn: async (values: Product) => {
      const res = await api.post("products", { json: values });

      return createProductResponseSchema.parse(await res.json());
    },
    onSuccess: () => {
      toast.success("Product added successfully");
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
    onError: async (error) => {
      if (error instanceof HTTPError) {
        const data = await error.response.json();
        if (data.message) toast.error(data.message);
      } else {
        toast.error("Something went wrong while addding product");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Product</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>
            Add product details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <ProductForm
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
