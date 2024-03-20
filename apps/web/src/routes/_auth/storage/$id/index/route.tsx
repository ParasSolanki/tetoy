import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  block: z.string().optional(),
});

export const Route = createFileRoute("/_auth/storage/$id/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ search }),
});
