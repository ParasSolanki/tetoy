import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  PaginationState,
  Row,
  SortingState,
  Table,
  VisibilityState,
} from "@tanstack/react-table";
import {
  deleteProductResponseSchema,
  paginatedProductsResponseSchema,
  updateProductResponseSchema,
} from "@tetoy/api/schema";
import { productsKeys, productsQuries } from "~/common/keys/products";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { DataTableViewOptions } from "~/components/ui/data-table/data-table-view-options";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UiTable,
} from "~/components/ui/table";
import { Route as ProductsRoute } from "~/routes/_auth/products/route";
import { api } from "~/utils/api-client";
import { format } from "date-fns";
import { HTTPError } from "ky";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import { z } from "zod";
import { ProductForm } from "./product-form";
import { Button } from "./ui/button";
import { DataTableColumnHeader } from "./ui/data-table/data-table-column-header";
import { DataTablePagination } from "./ui/data-table/data-table-pagination";

const productsSchema = paginatedProductsResponseSchema.shape.data.pick({
  products: true,
}).shape.products;

type Product = z.infer<typeof productsSchema>[number];

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "createdBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created By" />
    ),
    cell: ({ row }) => <span>{row.original.createdBy?.displayName}</span>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => <span>{format(row.original.createdAt, "PPP")}</span>,
  },
  {
    id: "actions",
    header: () => (
      <div className="flex h-8 items-center font-medium">Actions</div>
    ),
    cell: ({ row, table }) => <ProductsTableActions row={row} table={table} />,
  },
];

export function ProductsTable() {
  const navigate = useNavigate();
  const searchParams = ProductsRoute.useSearch({
    select: (search) => search,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState(
    searchParams.name ?? "",
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: searchParams.page,
      pageSize: searchParams.perPage,
    });
  const pagination = React.useMemo(
    () => ({ pageIndex, pageSize }),
    [pageIndex, pageSize],
  );

  const { data } = useQuery(productsQuries.list(searchParams));

  const table = useReactTable({
    data: data?.data.products ?? [],
    columns,
    state: {
      sorting,
      pagination,
      columnVisibility,
      globalFilter,
    },
    rowCount: data?.data.pagination.total ?? 0,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
  });

  React.useEffect(() => {
    navigate({
      to: "/products",
      search: {
        name: searchParams.name,
        page: searchParams.page,
        perPage: searchParams.perPage,
        product: searchParams.product,
      },
      replace: true,
    });
  }, [navigate, searchParams]);

  return (
    <div className="mt-10 space-y-4">
      <ProductsTableToolbar table={table} />
      <div className="rounded-md border">
        <UiTable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No Products.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UiTable>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

interface ProductsToolbarProps<TData> {
  table: Table<TData>;
}

export function ProductsTableToolbar<TData>({
  table,
}: ProductsToolbarProps<TData>) {
  const navigate = useNavigate();
  const debounced = useDebounceCallback((value: string) => {
    table.setGlobalFilter(value);
    navigate({
      to: "/products",
      search: {
        name: value,
        page: table.getState().pagination.pageIndex,
        perPage: table.getState().pagination.pageSize,
      },
    });
  }, 500);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          defaultValue={table.getState().globalFilter}
          placeholder="Search name"
          className="w-[250px]"
          onChange={(e) => debounced(e.target.value)}
        />
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}

interface ProductsTableActionsProps {
  table: Table<Product>;
  row: Row<Product>;
}

export function ProductsTableActions({
  row,
  table,
}: ProductsTableActionsProps) {
  const product = row.original;
  const navigate = useNavigate();
  const searchProduct = ProductsRoute.useSearch({
    select: (search) => search.product,
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(
    () => searchProduct === product.id,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  function handleOpenEditProductDialog(open: boolean) {
    setIsEditDialogOpen(open);

    navigate({
      to: "/products",
      search: {
        name: table.getState().globalFilter,
        page: table.getState().pagination.pageIndex,
        perPage: table.getState().pagination.pageSize,
        ...(open ? { product: product.id } : {}),
      },
      replace: true,
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontalIcon className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            className="focus:cursor-pointer"
            onSelect={() => handleOpenEditProductDialog(true)}
          >
            <PencilIcon className="mr-2 size-4" /> Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-red-500 focus:cursor-pointer focus:bg-destructive focus:text-white"
            onSelect={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2Icon className="mr-2 size-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditProductDialog
        open={isEditDialogOpen}
        product={product}
        onOpenChange={handleOpenEditProductDialog}
      />
      <DeleteProductAlertDialog
        open={isDeleteDialogOpen}
        productId={product.id}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
}

function EditProductDialog({
  product,
  open,
  onOpenChange,
}: EditProductDialogProps) {
  const queryClient = useQueryClient();
  const { isPending, mutate } = useMutation({
    mutationKey: ["products", "edit", product.id],
    mutationFn: async (values: unknown) => {
      const res = api.put(`products/${product.id}`, { json: values });

      return updateProductResponseSchema.parse(await res.json());
    },
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
    onError: async (error) => {
      if (error instanceof HTTPError) {
        const data = await error.response.json();
        if (data.message) toast.error(data.message);
      } else {
        toast.error("Something went wrong while updating product");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Edit product details here. Click save when you are done.
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          product={product}
          isPending={isPending}
          onSubmit={(values) => {
            mutate(values, {
              onSuccess: () => {
                onOpenChange(false);
              },
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

interface DeleteProductAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
}

function DeleteProductAlertDialog({
  open,
  onOpenChange,
  productId,
}: DeleteProductAlertDialogProps) {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationKey: ["products", "delete", productId],
    mutationFn: async () => {
      const res = await api.delete(`products/${productId}`);

      return deleteProductResponseSchema.parse(await res.json());
    },
    onSuccess: () => {
      toast.success("Product deleted successfuly");
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
    onError: async (error) => {
      if (error instanceof HTTPError) {
        const data = await error.response.json();
        if (data.message) toast.error(data.message);
      } else {
        toast.error("Something went wrong while deleting product");
      }
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will delete product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={() => mutate()}>
              Continue
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
