import { useSuspenseQuery } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { storageDimensionMap } from "@tetoy/api/schema";
import { storageBlockSchema, storagesQuries } from "~/common/keys/storage";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import * as React from "react";
import { z } from "zod";
import { Route as StorageIdRoute } from "../route";
import { Route as StorageIdIndexRoute } from "./route";

export const Route = createLazyFileRoute("/_auth/storage/$id/")({
  component: StorageDetailsIndexPage,
});

type StorageBlock = z.infer<typeof storageBlockSchema>[number];

type FormattedBlock = StorageBlock & { selected: boolean };

function StorageDetailsIndexPage() {
  const storageId = StorageIdRoute.useParams({ select: (p) => p.id });
  const searchBlock = StorageIdIndexRoute.useSearch({ select: (s) => s.block });

  const { data } = useSuspenseQuery(storagesQuries.details(storageId));

  const d = data?.data.storage.dimension
    ? // @ts-expect-error storage dimension is defined
      storageDimensionMap[data.data.storage.dimension]
    : null;

  const formattedBlocks = React.useMemo(() => {
    const blocks = data?.data.storage.blocks ?? [];
    if (!blocks.length) return [];

    const maxRow = Math.max(...blocks.map((block) => block.row));
    const maxCol = Math.max(...blocks.map((block) => block.column));
    const minRow = Math.min(...blocks.map((block) => block.row));
    const minCol = Math.min(...blocks.map((block) => block.column));

    const grid = Array.from({ length: maxRow }, () =>
      Array.from({ length: maxCol }, () => null),
    ) as Array<Array<FormattedBlock | null>>;

    blocks.forEach((block) => {
      grid[block.row - 1][block.column - 1] = {
        ...block,
        selected: searchBlock
          ? block.id === searchBlock // if matches with searchBlock
          : block.row === minRow && block.column === minCol, // else min
      };
    });

    return grid.flatMap((g) => g);
  }, [data?.data.storage.blocks, searchBlock]);

  if (!data) return "no data";

  return (
    <div>
      <section>
        <div
          className="grid grid-cols-1 gap-4"
          style={
            {
              "--grid-columns": d?.row ?? 0,
              "--grid-rows": d?.column ?? 0,
              gridTemplateColumns: `repeat(var(--grid-columns), minmax(0, 1fr))`,
              gridTemplateRows: `repeat(var(--grid-rows), minmax(0, 1fr))`,
            } as React.CSSProperties
          }
        >
          {formattedBlocks.map((b, index) =>
            b ? (
              <Link
                to="/storage/$id/"
                key={b.id}
                params={{ id: storageId }}
                search={{ block: b.id }}
                data-selected={b.selected}
                className={cn(
                  buttonVariants({
                    variant: b.selected ? "default" : "secondary",
                  }),
                  "data-[selected=true]:ring-2 data-[selected=true]:ring-offset-2",
                )}
              >
                {b.name}
              </Link>
            ) : (
              <span key={index} className="pointer-events-none"></span>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
