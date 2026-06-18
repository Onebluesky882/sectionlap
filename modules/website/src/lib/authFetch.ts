"use client";

import { useAuthStore } from "@/store/useAuthStore";

export function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = useAuthStore.getState().token;
  return fetch(input, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
