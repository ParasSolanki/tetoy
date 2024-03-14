import { createFileRoute } from "@tanstack/react-router";
import { paginatedCategoriesSearchSchema } from "@tetoy/api/schema";
import { categoriesQuries } from "~/common/keys/categories";
import { seo } from "~/utils/seo";
import { z } from "zod";

const searchSchema = paginatedCategoriesSearchSchema.extend({
  category: z.string().optional(),
});

export const Route = createFileRoute("/_auth/categories")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context: { queryClient }, deps: { search } }) => {
    queryClient.ensureQueryData(
      categoriesQuries.list({
        name: search.name,
        page: search.page,
        perPage: search.perPage,
      }),
    );
  },
  meta: () => {
    return seo({
      title: "Categories | Tetoy",
      description: "List of categories in tetoy",
    });
  },
});
