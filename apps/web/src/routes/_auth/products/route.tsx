import { createFileRoute } from "@tanstack/react-router";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/_auth/products")({
  meta: () => {
    return seo({
      title: "Products | Tetoy",
      description: "List of products in tetoy",
    });
  },
});
