"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { restoreSession } = useAuth();

  useEffect(() => {
    restoreSession();
  }, []);

  return <>{children}</>;
}
