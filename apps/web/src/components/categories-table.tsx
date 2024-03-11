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
  deleteCatgoryResponseSchema,
  paginatedCategoriesResponseSchema,
  updateCategoryResponseSchema,
  updateCategorySchema,
} from "@tetoy/api/schema";
import { categoriesKeys, categoriesQuries } from "~/common/keys/categories";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table as UiTable,
} from "~/components/ui/table";
import { Route as CategoriesRoute } from "~/routes/_auth/categories/route";
import { api } from "~/utils/api-client";
import { format } from "date-fns";
import { HTTPError } from "ky";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import { z } from "zod";
import { CategoryForm } from "./category-form";
import { Button } from "./ui/button";
import { DataTableColumnHeader } from "./ui/data-table/data-table-column-header";
import { DataTablePagination } from "./ui/data-table/data-table-pagination";

const categoriesSchema = paginatedCategoriesResponseSchema.shape.data.pick({
  categories: true,
}).shape.categories;

type Category = z.infer<typeof categoriesSchema>[number];

const columns: ColumnDef<Category>[] = [
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
    cell: ({ row, table }) => (
      <CategoriesTableActions row={row} table={table} />
    ),
  },
];

export function CategoriesTable() {
  const navigate = useNavigate();
  const searchParams = CategoriesRoute.useSearch({
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

  const { data } = useQuery(categoriesQuries.list(searchParams));

  const table = useReactTable({
    data: data?.data.categories ?? [],
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
      to: "/categories",
      search: {
        name: searchParams.name,
        page: searchParams.page,
        perPage: searchParams.perPage,
        category: searchParams.category,
      },
    });
  }, [navigate, searchParams]);

  return (
    <div className="mt-10 space-y-4">
      <CategoriesTableToolbar table={table} />
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
                  No Categories.
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

interface CategoriesToolbarProps<TData> {
  table: Table<TData>;
}

export function CategoriesTableToolbar<TData>({
  table,
}: CategoriesToolbarProps<TData>) {
  const navigate = useNavigate();
  const debounced = useDebounceCallback((value: string) => {
    table.setGlobalFilter(value);
    navigate({
      to: "/categories",
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

interface CategoriesTableActionsProps {
  table: Table<Category>;
  row: Row<Category>;
}

export function CategoriesTableActions({
  row,
  table,
}: CategoriesTableActionsProps) {
  const category = row.original;
  const navigate = useNavigate();
  const searchCategory = CategoriesRoute.useSearch({
    select: (search) => search.category,
  });
  const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(
    () => searchCategory === category.id,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  function handleOpenEditCategorySheet(open: boolean) {
    setIsEditSheetOpen(open);

    navigate({
      to: "/categories",
      search: {
        name: table.getState().globalFilter,
        page: table.getState().pagination.pageIndex,
        perPage: table.getState().pagination.pageSize,
        ...(open ? { category: category.id } : {}),
      },
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
            onSelect={() => handleOpenEditCategorySheet(true)}
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
      <EditCategorySheet
        open={isEditSheetOpen}
        category={category}
        onOpenChange={handleOpenEditCategorySheet}
      />
      <DeleteCategoryAlertDialog
        open={isDeleteDialogOpen}
        categoryId={category.id}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}

interface EditCategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category;
}

function EditCategorySheet({
  category,
  open,
  onOpenChange,
}: EditCategorySheetProps) {
  const queryClient = useQueryClient();
  const { isPending, mutate } = useMutation({
    mutationKey: ["categories", "edit", category.id],
    mutationFn: async (values: unknown) => {
      const res = api.put(`categories/${category.id}`, { json: values });

      return updateCategoryResponseSchema.parse(await res.json());
    },
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
    },
    onError: async (error) => {
      if (error instanceof HTTPError) {
        const data = await error.response.json();
        if (data.message) toast.error(data.message);
      } else {
        toast.error("Something went wrong while updating category");
      }
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Category</SheetTitle>
          <SheetDescription>
            Edit category details here. Click save when you are done.
          </SheetDescription>
        </SheetHeader>
        <CategoryForm
          category={category}
          schema={updateCategorySchema}
          isPending={isPending}
          onSubmit={(values) => {
            mutate(values, {
              onSuccess: () => {
                onOpenChange(false);
              },
            });
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

interface DeleteCategoryAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
}

function DeleteCategoryAlertDialog({
  open,
  onOpenChange,
  categoryId,
}: DeleteCategoryAlertDialogProps) {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationKey: ["categories", "delete", categoryId],
    mutationFn: async () => {
      const res = await api.delete(`categories/${categoryId}`);

      return deleteCatgoryResponseSchema.parse(await res.json());
    },
    onSuccess: () => {
      toast.success("Category deleted successfuly");
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
    },
    onError: async (error) => {
      if (error instanceof HTTPError) {
        const data = await error.response.json();
        if (data.message) toast.error(data.message);
      } else {
        toast.error("Something went wrong while deleting category");
      }
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will delete category.
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
