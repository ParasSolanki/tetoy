import { useQuery } from "@tanstack/react-query";
import { authResponseSchema } from "@tetoy/api/schema";
import { api } from "~/utils/api-client";
import { useSyncExternalStore } from "react";

type SubscribeListener = () => void;

let listeners = [] as Array<SubscribeListener>;
export const authState = {
  isAuthenticated: false,
  isInitialLoading: true,
};
export type AuthState = typeof authState;

export const authStore = {
  setIsInitialLoading(val: boolean) {
    authState.isInitialLoading = val;
    emitChange();
  },
  setIsAuthenticated(val: boolean) {
    authState.isAuthenticated = val;
    emitChange();
  },
  subscribe(listener: SubscribeListener) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return authState;
  },
};

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function useAuthState() {
  return useSyncExternalStore(authStore.subscribe, authStore.getSnapshot);
}

export function useSession() {
  const authState = useAuthState();
  const session = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await api.get("auth/session");

      return authResponseSchema.parse(await res.json());
    },
  });

  if (session.data) {
    const {
      ok,
      data: { user },
    } = session.data;

    if (ok && user) authStore.setIsAuthenticated(true);
    else authStore.setIsAuthenticated(false);
  }

  if (authState.isInitialLoading) {
    authStore.setIsInitialLoading(session.isLoading);
  }

  if (session.isError) {
    authStore.setIsInitialLoading(false);
  }

  return session;
}
