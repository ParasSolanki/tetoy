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
  deleteStorageResponseSchema,
  paginatedStoragesResponseSchema,
} from "@tetoy/api/schema";
import { storagesKeys, storagesQuries } from "~/common/keys/storage";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuAlertDialogItem,
  DropdownMenuContent,
  DropdownMenuDialogItem,
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
import { Route as StoragesRoute } from "~/routes/_auth/storages/route";
import { api } from "~/utils/api-client";
import { format } from "date-fns";
import { HTTPError } from "ky";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import { z } from "zod";
import { Button } from "./ui/button";
import { DataTableColumnHeader } from "./ui/data-table/data-table-column-header";
import { DataTablePagination } from "./ui/data-table/data-table-pagination";

const storagesSchema = paginatedStoragesResponseSchema.shape.data.pick({
  storages: true,
}).shape.storages;

type Storage = z.infer<typeof storagesSchema>[number];

const columns: ColumnDef<Storage>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "dimension",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dimension" />
    ),
  },
  {
    accessorKey: "capacity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Capacity" />
    ),
  },
  {
    id: "product",
    accessorFn: (d) => (d.product ? d.product.name : ""),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
  },
  {
    id: "category",
    accessorFn: (d) =>
      d.product && d.product.category ? d.product.category.name : "",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
  },
  {
    id: "subCategory",
    accessorFn: (d) =>
      d.product && d.product.subCategory ? d.product.subCategory.name : "",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sub Category" />
    ),
  },
  {
    id: "superVisor",
    accessorFn: (d) => (d.superVisor ? d.superVisor.displayName : ""),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sub Category" />
    ),
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
    cell: ({ row, table }) => <StoragesTableActions row={row} table={table} />,
  },
];

export function StoragesTable() {
  const navigate = useNavigate();
  const searchParams = StoragesRoute.useSearch({
    select: (search) => search,
  });

  const { data } = useQuery(storagesQuries.list(searchParams));
  const pageCount = data?.data.pagination.total ?? 0;

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const globalFilter = React.useMemo(
    () => searchParams.name ?? "",
    [searchParams.name],
  );

  const pagination = React.useMemo(
    () => ({
      pageIndex: pageCount > 0 ? searchParams.page - 1 : -1,
      pageSize: searchParams.perPage,
    }),
    [searchParams.page, searchParams.perPage, pageCount],
  );

  function handleSetPagination(updaterOrValue?: unknown) {
    if (typeof updaterOrValue !== "function") return;

    const newPagination = updaterOrValue(pagination);
    navigate({
      to: "/storages",
      search: {
        name: globalFilter,
        page: newPagination.pageIndex + 1,
        perPage: newPagination.pageSize,
      },
      replace: true,
    });
  }

  const table = useReactTable({
    data: data?.data.storages ?? [],
    columns,
    state: {
      sorting,
      pagination,
      columnVisibility,
      globalFilter,
    },
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handleSetPagination,
    manualPagination: true,
  });

  return (
    <div className="mt-10 space-y-4">
      <StoragesTableToolbar table={table} />
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
                  No Storages.
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

interface StoragesToolbarProps<TData> {
  table: Table<TData>;
}

export function StoragesTableToolbar<TData>({
  table,
}: StoragesToolbarProps<TData>) {
  const navigate = useNavigate();
  const debounced = useDebounceCallback((value: string) => {
    table.setGlobalFilter(value);
    navigate({
      to: "/storages",
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

interface StoragesTableActions {
  table: Table<Storage>;
  row: Row<Storage>;
}

export function StoragesTableActions({ row }: StoragesTableActions) {
  const storage = row.original;

  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [hasOpenItem, setHasOpenItem] = React.useState(false);

  const dropdownMenuTriggerRef = React.useRef<HTMLButtonElement>(null);
  const focusRef = React.useRef<HTMLButtonElement | null>(null);

  const { mutate: mutateDeleteProduct } = useMutation({
    mutationKey: ["storages", "delete", storage.id],
    mutationFn: async () => {
      const res = await api.delete(`storages/${storage.id}`);

      return deleteStorageResponseSchema.parse(await res.json());
    },
    onSuccess: () => {
      toast.success("Storage deleted successfuly");
      queryClient.invalidateQueries({ queryKey: storagesKeys.all });
    },
    onError: async (error) => {
      if (error instanceof HTTPError) {
        const data = await error.response.json();
        if (data.message) toast.error(data.message);
      } else {
        toast.error("Something went wrong while deleting storage");
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

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          ref={dropdownMenuTriggerRef}
          variant="ghost"
          className="flex size-8 p-0 data-[state=open]:bg-muted"
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
        <DropdownMenuDialogItem
          triggerChildern={
            <>
              <PencilIcon className="mr-2 size-4" /> Edit
            </>
          }
          onSelect={handleItemSelect}
          onOpenChange={handleItemOpenChange}
        >
          <DialogHeader>
            <DialogTitle>Edit storage</DialogTitle>
            <DialogDescription>
              Edit storage details here. Click save when you are done.
            </DialogDescription>
          </DialogHeader>
        </DropdownMenuDialogItem>

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
              This action cannot be undone. This will delete storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => mutateDeleteProduct()}
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
