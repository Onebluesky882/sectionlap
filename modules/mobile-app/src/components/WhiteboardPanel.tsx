import { Text, View } from "react-native";
import { useSyncRoom } from "../hooks/useSyncRoom";
import { SyncCanvas } from "./SyncCanvas";
import type { Stroke } from "../types";

interface Props {
  sectionSessionId: string;
}

export function WhiteboardPanel({ sectionSessionId }: Props) {
  const { doc, status } = useSyncRoom(`whiteboard-${sectionSessionId}`);
  const strokes = doc?.getArray<Stroke>("strokes");

  return (
    <View className="gap-2">
      {status !== "connected" && (
        <Text className="text-sm text-muted-foreground">
          {status === "connecting"
            ? "Connecting to whiteboard…"
            : "Disconnected. Make sure modules/sync-service is running."}
        </Text>
      )}
      <SyncCanvas strokes={strokes} width={320} height={400} />
    </View>
  );
}
