import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  createProductSchema,
  paginatedProductsResponseSchema,
} from "@tetoy/api/schema";
import { categoriesQuries } from "~/common/keys/categories";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { DialogClose, DialogFooter } from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { Check, ChevronsUpDown, Loader2Icon } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { Virtuoso } from "react-virtuoso";
import { useDebounceValue } from "usehooks-ts";
import { z } from "zod";

export type Product = z.infer<typeof createProductSchema>;

const productsSchema = paginatedProductsResponseSchema.shape.data.pick({
  products: true,
}).shape.products;

type EditProduct = z.infer<typeof productsSchema>[number];
interface ProductFormProps {
  product?: EditProduct;
  isPending: boolean;
  onSubmit: (values: Product) => void;
}

type Category = {
  id: string;
  name: string;
  subCategories: Array<{
    id: string;
    name: string;
  }>;
};

export function ProductForm({
  product,
  isPending,
  onSubmit,
}: ProductFormProps) {
  const [open, setOpen] = React.useState(false);
  const [category, setCategory] = React.useState<Category | undefined>(() => {
    if (product?.category && product.subCategory) {
      return {
        id: product.category.id,
        name: product.category.name,
        subCategories: [
          { id: product.subCategory.id, name: product.subCategory.name },
        ],
      };
    }

    return undefined;
  });
  const [debouncedSearchTerm, setSearchTerm] = useDebounceValue(
    product?.category?.name ?? "",
    500,
  );

  const form = useForm<z.infer<typeof createProductSchema>>({
    resolver: zodResolver(createProductSchema),
    values: {
      name: product?.name ?? "",
      categoryId: product?.category?.id ?? "",
      subCategoryId: product?.subCategory?.id ?? "",
    },
  });

  const { data, fetchNextPage, isFetching } = useInfiniteQuery(
    categoriesQuries.infinite({ name: debouncedSearchTerm }),
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset
          className="space-y-4"
          disabled={isPending}
          aria-disabled={isPending}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Category</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="justify-between"
                      >
                        {field.value && category
                          ? category.name
                          : "Select category..."}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search category..."
                        onInput={(e) => setSearchTerm(e.currentTarget.value)}
                      />
                      <CommandList>
                        {!isFetching &&
                          !data?.pages[0].data.categories.length && (
                            <CommandEmpty>No categories</CommandEmpty>
                          )}

                        {!!data &&
                          !!data.pages &&
                          !!data.pages[0].data.categories.length && (
                            <CommandGroup>
                              <Virtuoso
                                style={{ height: "160px" }}
                                data={data.pages}
                                endReached={() => fetchNextPage()}
                                overscan={200}
                                itemContent={(index) => {
                                  if (
                                    data.pages[index].data.categories.length < 1
                                  ) {
                                    return (
                                      <div className="h-2 opacity-0">end</div>
                                    );
                                  }

                                  return data.pages[index].data.categories.map(
                                    (c) => (
                                      <CommandItem
                                        key={c.id}
                                        value={c.name}
                                        onSelect={() => {
                                          setCategory({
                                            id: c.id,
                                            name: c.name,
                                            subCategories: c.subCategories,
                                          });
                                          form.setValue("categoryId", c.id);
                                          form.setValue("subCategoryId", "");
                                          setOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            category?.id === c.id
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                        {c.name}
                                      </CommandItem>
                                    ),
                                  );
                                }}
                              />
                            </CommandGroup>
                          )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subCategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      disabled={!category}
                      aria-disabled={!category}
                    >
                      <SelectValue placeholder="Select a sub category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {category &&
                      category.subCategories.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              aria-disabled={isPending}
            >
              {isPending && (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </fieldset>
      </form>
    </Form>
  );
}
