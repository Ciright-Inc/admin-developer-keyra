"use client";

import { create } from "zustand";
import {
  type AdminMe,
  type AuthSessionUser,
  getAdminMe,
  logout as logoutRequest,
} from "@/lib/keyra-auth-service";
import { hasPendingAuthReturn } from "@/lib/get-started-sign-in-url";

export type AdminAuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "forbidden"
  | "unreachable";

type AdminAuthState = {
  admin: AdminMe | null;
  user: AuthSessionUser | null;
  status: AdminAuthStatus;
  hydrated: boolean;
  error: string | null;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AUTH_RETURN_RETRY_MS = 400;
const AUTH_RETURN_MAX_ATTEMPTS = 5;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function load(options?: { authReturnFlow?: boolean }): Promise<Partial<AdminAuthState>> {
  const maxAttempts = options?.authReturnFlow ? AUTH_RETURN_MAX_ATTEMPTS : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) await sleep(AUTH_RETURN_RETRY_MS);

    const result = await getAdminMe();

    if (result.status !== "unauthenticated" || attempt === maxAttempts - 1) {
      switch (result.status) {
        case "ok":
          return {
            admin: result.admin,
            user: result.admin,
            status: "authenticated",
            hydrated: true,
            error: null,
          };
        case "unauthenticated":
          return { admin: null, user: null, status: "unauthenticated", hydrated: true, error: null };
        case "forbidden":
          return {
            admin: null,
            user: result.user ?? null,
            status: "forbidden",
            hydrated: true,
            error: null,
          };
        case "unreachable":
        default:
          return { admin: null, user: null, status: "unreachable", hydrated: true, error: result.error };
      }
    }
  }

  return { admin: null, user: null, status: "unauthenticated", hydrated: true, error: null };
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  admin: null,
  user: null,
  status: "idle",
  hydrated: false,
  error: null,
  init: async () => {
    if (get().status === "loading") return;
    set({ status: "loading" });
    const authReturnFlow = hasPendingAuthReturn();
    const patch = await load({ authReturnFlow });
    set(patch);
  },
  refresh: async () => {
    const patch = await load({ authReturnFlow: hasPendingAuthReturn() });
    set(patch);
  },
  signOut: async () => {
    await logoutRequest();
    set({ admin: null, user: null, status: "unauthenticated", hydrated: true, error: null });
  },
}));
