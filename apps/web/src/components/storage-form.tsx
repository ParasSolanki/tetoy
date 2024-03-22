import { zodResolver } from "@hookform/resolvers/zod";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  createStorageSchema,
  paginatedStoragesResponseSchema,
} from "@tetoy/api/schema";
import { productsQuries } from "~/common/keys/products";
import { usersQuries } from "~/common/keys/users";
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
import { Label } from "./ui/label";

export type Storage = z.infer<typeof createStorageSchema>;

const stoagesSchema = paginatedStoragesResponseSchema.shape.data.pick({
  storages: true,
}).shape.storages;

type EditStorage = z.infer<typeof stoagesSchema>[number];
interface StorageFormProps {
  storage?: EditStorage;
  isPending: boolean;
  onSubmit: (values: Storage) => void;
}

type StorageSuperVisor = Pick<
  NonNullable<EditStorage["superVisor"]>,
  "id" | "displayName"
>;
type StorageProduct = EditStorage["product"];
type StorageProductCategory = NonNullable<StorageProduct>["category"];
type StorageProductSubCategory = NonNullable<StorageProduct>["subCategory"];

export function StorageForm({
  storage,
  isPending,
  onSubmit,
}: StorageFormProps) {
  const [open, setOpen] = React.useState(false);
  const [superVisorOpen, setSuperVisorOpen] = React.useState(false);
  const [product, setProduct] = React.useState<StorageProductCategory>(null);
  const [category, setCategory] = React.useState<StorageProductCategory>(null);
  const [subCategory, setSubCategory] =
    React.useState<StorageProductSubCategory>(null);
  const [superVisor, setSuperVisor] = React.useState<StorageSuperVisor>();
  const [debouncedSearchTerm, setSearchTerm] = useDebounceValue("", 500);
  const [superVisorSearchTerm, setSuperVisorSearchTerm] = useDebounceValue(
    "",
    500,
  );

  const form = useForm<z.infer<typeof createStorageSchema>>({
    resolver: zodResolver(createStorageSchema),
    values: {
      name: storage?.name ?? "",
      capacity: storage?.capacity ?? "",
      dimension: storage?.dimension ?? "1x1",
      productId: storage?.product?.id ?? "",
      superVisorId: storage?.superVisor?.id ?? "",
    },
  });

  const { data, fetchNextPage, isFetching } = useInfiniteQuery(
    productsQuries.infinite({ name: debouncedSearchTerm }),
  );

  const {
    data: superVisors,
    fetchNextPage: fetchNextPageSuperVisor,
    isFetching: isFetchingSuperVisor,
  } = useInfiniteQuery(usersQuries.infinite({ name: superVisorSearchTerm }));

  const handleChangeProduct = React.useCallback(
    (product: NonNullable<StorageProduct>) => {
      setProduct({ id: product.id, name: product.name });
      form.setValue("productId", product.id);

      setCategory(
        product.category
          ? { id: product.category.id, name: product.category.name }
          : null,
      );

      setSubCategory(
        product.subCategory
          ? {
              id: product.subCategory.id,
              name: product.subCategory.name,
            }
          : null,
      );

      setOpen(false);
    },
    [form],
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
            name="productId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Product</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="justify-between"
                      >
                        {field.value && product
                          ? product.name
                          : "Select product..."}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search prodct..."
                        onInput={(e) => setSearchTerm(e.currentTarget.value)}
                      />
                      <CommandList>
                        {!isFetching &&
                          !data?.pages[0].data.products.length && (
                            <CommandEmpty>No products</CommandEmpty>
                          )}

                        {!!data &&
                          !!data.pages &&
                          !!data.pages[0].data.products.length && (
                            <CommandGroup>
                              <Virtuoso
                                style={{ height: "160px" }}
                                data={data.pages}
                                endReached={() => fetchNextPage()}
                                overscan={200}
                                itemContent={(index) => {
                                  if (
                                    data.pages[index].data.products.length < 1
                                  ) {
                                    return (
                                      <div className="h-2 opacity-0">end</div>
                                    );
                                  }

                                  return data.pages[index].data.products.map(
                                    (p) => (
                                      <CommandItem
                                        key={p.id}
                                        value={p.name}
                                        onSelect={() => handleChangeProduct(p)}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            product?.id === p.id
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                        {p.name}
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

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0">
            <div className="w-full sm:w-6/12 sm:px-2">
              <div className="space-y-2 sm:-ml-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category?.name ?? ""}
                  disabled
                  aria-disabled
                  placeholder="Category"
                />
              </div>
            </div>
            <div className="w-full sm:w-6/12 sm:px-2">
              <div className="space-y-2 sm:-mr-2">
                <Label htmlFor="sub-category">Sub Category</Label>
                <Input
                  id="sub-category"
                  value={subCategory?.name ?? ""}
                  disabled
                  aria-disabled
                  placeholder="Sub Category"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0">
            <div className="w-full sm:w-6/12 sm:px-2">
              <FormField
                control={form.control}
                name="dimension"
                render={({ field }) => (
                  <FormItem className="sm:-ml-2">
                    <FormLabel>Dimension</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <FormControl>
                          <SelectValue placeholder="Select a dimension" />
                        </FormControl>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1x1">1x1</SelectItem>
                        <SelectItem value="2x2">2x2</SelectItem>
                        <SelectItem value="3x3">3x3</SelectItem>
                        <SelectItem value="4x4">4x4</SelectItem>
                        <SelectItem value="5x5">5x5</SelectItem>
                        <SelectItem value="6x6">6x6</SelectItem>
                        <SelectItem value="7x7">7x7</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full sm:w-6/12 sm:px-2">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem className="sm:-mr-2">
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Capacity" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="superVisorId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Super visor</FormLabel>
                <Popover open={superVisorOpen} onOpenChange={setSuperVisorOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={superVisorOpen}
                        className="justify-between"
                      >
                        {field.value && superVisor
                          ? superVisor.displayName
                          : "Select supervisor..."}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search supervisor..."
                        onInput={(e) =>
                          setSuperVisorSearchTerm(e.currentTarget.value)
                        }
                      />
                      <CommandList>
                        {!isFetchingSuperVisor &&
                          !superVisors?.pages[0].data.users.length && (
                            <CommandEmpty>No supervisors</CommandEmpty>
                          )}

                        {!!superVisors &&
                          !!superVisors.pages &&
                          !!superVisors.pages[0].data.users.length && (
                            <CommandGroup>
                              <Virtuoso
                                style={{ height: "160px" }}
                                data={superVisors.pages}
                                endReached={() => fetchNextPageSuperVisor()}
                                overscan={200}
                                itemContent={(index) => {
                                  if (
                                    superVisors.pages[index].data.users.length <
                                    1
                                  ) {
                                    return (
                                      <div className="h-2 opacity-0">end</div>
                                    );
                                  }

                                  return superVisors.pages[
                                    index
                                  ].data.users.map((u) => (
                                    <CommandItem
                                      key={u.id}
                                      value={u.id}
                                      onSelect={() => {
                                        form.setValue("superVisorId", u.id);
                                        setSuperVisor({
                                          id: u.id,
                                          displayName: u.displayName,
                                        });
                                        setSuperVisorOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          superVisor?.id === u.id
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      {u.displayName}
                                    </CommandItem>
                                  ));
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

          <DialogFooter className="space-y-4 sm:space-y-0">
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
