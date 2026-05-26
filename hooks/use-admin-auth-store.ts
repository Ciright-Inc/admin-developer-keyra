"use client";

import { create } from "zustand";
import {
  type AdminMe,
  type AuthSessionUser,
  getAdminMe,
  logout as logoutRequest,
} from "@/lib/keyra-auth-service";

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

async function load(): Promise<Partial<AdminAuthState>> {
  const result = await getAdminMe();
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

export const useAdminAuthStore = create<AdminAuthState>((set, get) => ({
  admin: null,
  user: null,
  status: "idle",
  hydrated: false,
  error: null,
  init: async () => {
    if (get().status === "loading") return;
    set({ status: "loading" });
    const patch = await load();
    set(patch);
  },
  refresh: async () => {
    const patch = await load();
    set(patch);
  },
  signOut: async () => {
    await logoutRequest();
    set({ admin: null, user: null, status: "unauthenticated", hydrated: true, error: null });
  },
}));
