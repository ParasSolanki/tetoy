import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { swaggerUI } from "@hono/swagger-ui";
import {
  authRoutes,
  categoryRoutes,
  meRoutes,
  productRoutes,
} from "./routes/index.js";
import { createOpenApiHono } from "./utils/openapi-hono.js";

export const app = createOpenApiHono()
  .doc31("/doc", {
    openapi: "3.1.0",
    info: {
      version: "1.0.0",
      title: "API",
    },
  })
  .use("*", logger())
  .use("*", prettyJSON())
  .get("/ui", swaggerUI({ url: "/doc" }))
  .route("/api/auth", authRoutes)
  .route("/api/me", meRoutes)
  .route("/api/categories", categoryRoutes)
  .route("/api/products", productRoutes);
