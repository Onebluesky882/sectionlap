import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useSyncRoom } from "../hooks/useSyncRoom";
import { SyncCanvas } from "./SyncCanvas";
import { Input } from "./Input";
import type { Stroke } from "../types";

interface Props {
  sectionSessionId: string;
}

export function DocumentHighlightPanel({ sectionSessionId }: Props) {
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
    <View className="gap-2">
      {status !== "connected" && (
        <Text className="text-sm text-muted-foreground">
          {status === "connecting"
            ? "Connecting to document highlight…"
            : "Disconnected. Make sure modules/sync-service is running."}
        </Text>
      )}
      <Text className="text-sm font-semibold text-foreground">Document URL</Text>
      <Input
        value={url}
        onChangeText={handleSetUrl}
        placeholder="https://example.com/page.png"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <SyncCanvas
        strokes={highlights}
        width={320}
        height={400}
        backgroundImageUrl={url || undefined}
      />
    </View>
  );
}
