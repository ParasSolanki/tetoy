import { app } from "./app.js";

type User = {
  id: string;
  email: string;
};

export type AppType = typeof app;

export interface ContextEnv {
  Variables: {
    user: User;
  };
}
