import { useEffect, useState } from "react";
import { JITSI_BASE_URL } from "../config";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: Record<string, unknown>
    ) => JitsiMeetExternalApi;
  }
}

export interface JitsiMeetExternalApi {
  dispose: () => void;
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
}

let scriptPromise: Promise<void> | null = null;

function loadExternalApiScript(): Promise<void> {
  if (window.JitsiMeetExternalAPI) {
    return Promise.resolve();
  }
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${JITSI_BASE_URL}/external_api.js`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Jitsi external_api.js"));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export function useJitsiExternalApi() {
  const [ready, setReady] = useState(!!window.JitsiMeetExternalAPI);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready) return;
    loadExternalApiScript()
      .then(() => setReady(true))
      .catch((err: Error) => setError(err.message));
  }, [ready]);

  return { ready, error };
}
