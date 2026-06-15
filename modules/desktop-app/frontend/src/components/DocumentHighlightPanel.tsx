import { useEffect, useState } from "react";
import { useSyncRoom } from "../hooks/useSyncRoom";
import { SyncCanvas } from "./SyncCanvas";
import type { Stroke } from "../types";

const WIDTH = 800;
const HEIGHT = 500;

interface DocumentHighlightPanelProps {
  sectionSessionId: string;
}

export function DocumentHighlightPanel({ sectionSessionId }: DocumentHighlightPanelProps) {
  const { doc, status } = useSyncRoom(`highlight-${sectionSessionId}`);
  const highlights = doc?.getArray<Stroke>("highlights");
  const documentMap = doc?.getMap<string>("document");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!documentMap) return;
    const sync = () => setUrl(documentMap.get("url") ?? "");
    sync();
    documentMap.observe(sync);
    return () => documentMap.unobserve(sync);
  }, [documentMap]);

  const handleSetUrl = (value: string) => {
    setUrl(value);
    documentMap?.set("url", value);
  };

  return (
    <div className="flex flex-col gap-3">
      {status !== "connected" && (
        <div className="text-muted-foreground text-sm mt-4">
          {status === "connecting"
            ? "Connecting to document highlight…"
            : "Disconnected from sync service. Make sure modules/sync-service is running."}
        </div>
      )}
      <label className="flex flex-col gap-1 max-w-sm text-sm">
        Document URL
        <input
          className="bg-input/30 border border-border rounded-md text-foreground px-2 py-1.5"
          type="text"
          value={url}
          placeholder="https://example.com/page.png"
          onChange={(event) => handleSetUrl(event.target.value)}
        />
      </label>
      <SyncCanvas strokes={highlights} width={WIDTH} height={HEIGHT} backgroundImageUrl={url || undefined} />
    </div>
  );
}
