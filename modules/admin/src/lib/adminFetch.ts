"use client";

import { useAdminAuthStore } from "@/store/useAdminAuthStore";

export function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = useAdminAuthStore.getState().token;
  return fetch(input, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
