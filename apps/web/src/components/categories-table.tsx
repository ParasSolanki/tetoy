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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { DataTableViewOptions } from "~/components/ui/data-table/data-table-view-options";
import {
  DropdownMenu,
  DropdownMenuAlertDialogItem,
  DropdownMenuContent,
  DropdownMenuSheetItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
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

  const { data } = useQuery(categoriesQuries.list(searchParams));

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const globalFilter = React.useMemo(
    () => searchParams.name ?? "",
    [searchParams.name],
  );

  console.log({ searchParams });

  const pagination = React.useMemo(
    () => ({
      pageIndex:
        data && data.data.pagination.total > 0 ? searchParams.page - 1 : -1,
      pageSize: searchParams.perPage,
    }),
    [searchParams.page, searchParams.perPage, data],
  );

  console.log({ pagination }, data && data.data.pagination.total > 0);

  function handleSetPagination(updaterOrValue?: unknown) {
    if (typeof updaterOrValue !== "function") return;

    const newPagination = updaterOrValue(pagination);

    navigate({
      to: "/categories",
      search: {
        name: globalFilter,
        page: newPagination.pageIndex + 1,
        perPage: newPagination.pageSize,
      },
      replace: true,
    });
  }

  const table = useReactTable({
    data: data?.data.categories ?? [],
    columns,
    state: {
      sorting,
      pagination,
      columnVisibility,
      globalFilter,
    },
    pageCount: data?.data.pagination.total ?? 0,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handleSetPagination,
    manualPagination: true,
  });

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
        page:
          table.getPageCount() > 0
            ? table.getState().pagination.pageIndex + 1
            : 1,
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
  const queryClient = useQueryClient();
  const searchCategory = CategoriesRoute.useSearch({
    select: (search) => search.category,
  });
  const [open, setOpen] = React.useState(() => category.id === searchCategory);
  const [hasOpenItem, setHasOpenItem] = React.useState(
    () => category.id === searchCategory,
  );
  const [editOpen, setEditOpen] = React.useState(
    () => category.id === searchCategory,
  );
  const dropdownMenuTriggerRef = React.useRef<HTMLButtonElement>(null);
  const focusRef = React.useRef<HTMLButtonElement | null>(null);

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

  const { mutate: mutateDeleteCategory } = useMutation({
    mutationKey: ["categories", "delete", category.id],
    mutationFn: async () => {
      const res = await api.delete(`categories/${category.id}`);

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

  function handleItemSelect() {
    focusRef.current = dropdownMenuTriggerRef.current;
  }

  function handleItemOpenChange(open: boolean) {
    setHasOpenItem(open);

    if (open === false) setOpen(false);
  }

  function handleOpenEditCategorySheet(open: boolean) {
    handleItemOpenChange(open);
    setEditOpen(open);
    navigate({
      to: "/categories",
      search: {
        name: table.getState().globalFilter,
        page:
          table.getPageCount() > 0
            ? table.getState().pagination.pageIndex + 1
            : 1,
        perPage: table.getState().pagination.pageSize,
        ...(open ? { category: category.id } : {}),
      },
      replace: true,
    });
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          ref={dropdownMenuTriggerRef}
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontalIcon className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px]"
        hidden={hasOpenItem}
        onCloseAutoFocus={(event) => {
          if (focusRef.current) {
            focusRef.current?.focus();
            focusRef.current = null;
            event.preventDefault();
          }
        }}
      >
        <DropdownMenuSheetItem
          open={editOpen}
          triggerChildern={
            <>
              <PencilIcon className="mr-2 size-4" /> Edit
            </>
          }
          onSelect={handleItemSelect}
          onOpenChange={handleOpenEditCategorySheet}
        >
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
            onSubmit={(values) => mutate(values)}
          />
        </DropdownMenuSheetItem>

        <DropdownMenuAlertDialogItem
          triggerChildern={
            <>
              <Trash2Icon className="mr-2 size-4" /> Delete
            </>
          }
          onSelect={handleItemSelect}
          onOpenChange={handleItemOpenChange}
          className="text-red-500 focus:cursor-pointer focus:bg-destructive focus:text-white"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will delete category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => mutateDeleteCategory()}
              >
                Continue
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </DropdownMenuAlertDialogItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
