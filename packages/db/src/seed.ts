import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { env } from "./env.js";
import { countries } from "./data.js";
import { countriesTable } from "./schema.js";

async function main() {
  const client = createClient({
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  });

  const db = drizzle(client);

  console.log("Seeding countries data");

  const quries = [];

  for (const country of countries) {
    quries.push(db.insert(countriesTable).values({ name: country.name }));
  }

  // @ts-expect-error quries are in array for batch
  await db.batch(quries);

  client.close();

  console.log("Seed complete");

  process.exit(0);
}

main().catch((e) => {
  console.error("Migration failed");
  console.error(e);
  process.exit(1);
});
