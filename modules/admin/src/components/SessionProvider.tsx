"use client";

import { useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { restoreSession } = useAdminAuth();

  useEffect(() => {
    restoreSession();
  }, []);

  return <>{children}</>;
}
