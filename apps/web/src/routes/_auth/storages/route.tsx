import { createFileRoute } from "@tanstack/react-router";
import { seo } from "~/utils/seo";

export const Route = createFileRoute("/_auth/storages")({
  meta: () => {
    return seo({
      title: "Storages | Tetoy",
      description: "List of storages in tetoy",
    });
  },
});
