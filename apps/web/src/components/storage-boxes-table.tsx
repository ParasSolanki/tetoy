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
  deleteStorageBoxResponseSchema,
  paginatedStorageBlockBoxesResponseSchema,
} from "@tetoy/api/schema";
import { storagesKeys, storagesQuries } from "~/common/keys/storage";
import type { FormattedBlock } from "~/common/keys/storage";
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
import { Route as StoragesIdIndexRoute } from "~/routes/_auth/storage/$id/index/route";
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

const boxesSchema = paginatedStorageBlockBoxesResponseSchema.shape.data.pick({
  boxes: true,
}).shape.boxes;

type Box = z.infer<typeof boxesSchema>[number];

const columns: ColumnDef<Box>[] = [
  {
    id: "product",
    accessorFn: ({ product }) => product?.name ?? "",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
  },
  {
    accessorKey: "weight",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weight" />
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
  },
  {
    accessorKey: "grade",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Grade" />
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created at" />
    ),
    cell: ({ row }) => (
      <span>{format(new Date(row.original.createdAt), "PPP")}</span>
    ),
  },
  {
    id: "actions",
    header: () => (
      <div className="flex h-8 items-center font-medium">Actions</div>
    ),
    cell: ({ row, table }) => (
      <StorageBoxesTableActions row={row} table={table} />
    ),
  },
];

interface StorageBoxesTableProps {
  block: FormattedBlock;
}

export function StorageBoxesTable({ block }: StorageBoxesTableProps) {
  const navigate = useNavigate();
  const storageId = StoragesIdIndexRoute.useParams({ select: (p) => p.id });
  const searchParams = StoragesIdIndexRoute.useSearch({
    select: (search) => ({
      name: search.name,
      page: search.page,
      perPage: search.perPage,
    }),
  });

  const { data } = useQuery(
    storagesQuries.boxesList(storageId, block.id, searchParams),
  );
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
      to: "/storage/$id/",
      params: { id: storageId },
      search: {
        block: block.id,
        name: globalFilter,
        page: newPagination.pageIndex + 1,
        perPage: newPagination.pageSize,
      },
      replace: true,
    });
  }

  const table = useReactTable({
    data: data?.data.boxes ?? [],
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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">{block.name}</h2>
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
                  No Boxes.
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
  const storageId = StoragesIdIndexRoute.useParams({ select: (p) => p.id });
  const debounced = useDebounceCallback((value: string) => {
    table.setGlobalFilter(value);
    navigate({
      to: "/storage/$id/",
      params: { id: storageId },
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

interface StorageBoxesTableActions {
  table: Table<Box>;
  row: Row<Box>;
}

export function StorageBoxesTableActions({
  table,
  row,
}: StorageBoxesTableActions) {
  const storageId = StoragesIdIndexRoute.useParams({ select: (p) => p.id });

  const box = row.original;

  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [hasOpenItem, setHasOpenItem] = React.useState(false);

  const dropdownMenuTriggerRef = React.useRef<HTMLButtonElement>(null);
  const focusRef = React.useRef<HTMLButtonElement | null>(null);

  const { mutate: mutateDeleteBox } = useMutation({
    mutationKey: [
      "storages",
      storageId,
      "block",
      box.block?.id,
      "boxes",
      "delete",
      box.id,
    ],
    mutationFn: async () => {
      if (!box.block?.id) {
        throw new Error("Block id does not exists");
      }

      const res = await api.delete(
        `storages/${storageId}/blocks/${box.block.id}/boxes/${box.id}`,
      );

      return deleteStorageBoxResponseSchema.parse(await res.json());
    },
    onSuccess: () => {
      toast.success("Box deleted successfuly");

      if (box.block?.id) {
        queryClient.invalidateQueries({
          queryKey: storagesKeys.boxesList(storageId, box.block.id, {
            name: table.getState().globalFilter,
            page:
              table.getPageCount() > 0
                ? table.getState().pagination.pageIndex + 1
                : 1,
            perPage: table.getState().pagination.pageSize,
          }),
        });
      }
    },
    onError: async (error) => {
      if (error instanceof HTTPError) {
        const data = await error.response.json();
        if (data.message) toast.error(data.message);
      } else {
        toast.error("Something went wrong while deleting box");
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
          className="text-red-500 focus:bg-destructive focus:text-white"
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will delete box.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={() => mutateDeleteBox()}>
                Continue
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </DropdownMenuAlertDialogItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
