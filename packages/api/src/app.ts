import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import {
  authRoutes,
  categoryRoutes,
  meRoutes,
  productRoutes,
  storageRoutes,
  userRoutes,
} from "./routes/index.js";
import { createOpenApiHono } from "./utils/openapi-hono.js";
import { apiReference } from "@scalar/hono-api-reference";

export const app = createOpenApiHono()
  .doc31("/doc", {
    openapi: "3.1.0",
    info: {
      version: "1.0.0",
      title: "Tetoy API Docs",
    },
  })
  .use("*", logger())
  .use("*", prettyJSON())
  .get(
    "/docs",
    apiReference({
      pageTitle: "Tetoy API Docs",
      spec: {
        url: "/doc",
      },
    })
  )
  .route("/api/auth", authRoutes)
  .route("/api/me", meRoutes)
  .route("/api/users", userRoutes)
  .route("/api/categories", categoryRoutes)
  .route("/api/products", productRoutes)
  .route("/api/storages", storageRoutes);
