import { client } from "@tetoy/db";
import { LibSQLAdapter } from "@lucia-auth/adapter-sqlite";
import { Lucia, TimeSpan } from "lucia";
import { env } from "../env.js";

const adapter = new LibSQLAdapter(client, {
  user: "users",
  session: "user_session",
});

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(1, "d"),
  sessionCookie: {
    name: "tetoy-session",
    expires: true,
    attributes: {
      sameSite: "lax",
      // set to `true` when using HTTPS
      secure: env.NODE_ENV === "production",
    },
  },

  getUserAttributes: (attributes) => {
    return {
      // attributes has the type of DatabaseUserAttributes
      email: attributes.email,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }

  interface DatabaseUserAttributes {
    email: string;
  }
}
