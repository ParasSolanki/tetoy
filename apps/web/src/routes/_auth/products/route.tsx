import { createFileRoute } from "@tanstack/react-router";
import { productsQuries, productsSearchSchema } from "~/common/keys/products";
import { seo } from "~/utils/seo";
import { z } from "zod";

const searchSchema = productsSearchSchema.extend({
  product: z.string().optional(),
});

export const Route = createFileRoute("/_auth/products")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context: { queryClient }, deps: { search } }) => {
    queryClient.ensureQueryData(
      productsQuries.list({
        name: search.name,
        page: search.page,
        perPage: search.perPage,
      }),
    );
  },
  meta: () => {
    return seo({
      title: "Products | Tetoy",
      description: "List of products in tetoy",
    });
  },
});
