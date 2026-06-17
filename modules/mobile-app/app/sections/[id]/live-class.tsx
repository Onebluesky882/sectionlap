import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSection } from "../../../src/hooks/useSection";
import { JITSI_BASE_URL } from "../../../src/config";
import { getJitsiToken } from "../../../src/services/sectionService";
import { WhiteboardPanel } from "../../../src/components/WhiteboardPanel";
import { DocumentHighlightPanel } from "../../../src/components/DocumentHighlightPanel";

type Tab = "video" | "whiteboard" | "highlight";

const TABS: { id: Tab; label: string }[] = [
  { id: "video", label: "Video Call" },
  { id: "whiteboard", label: "Whiteboard" },
  { id: "highlight", label: "Document Highlight" },
];

export default function LiveClassPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { section, booking } = useSection(id);
  const [tab, setTab] = useState<Tab>("video");
  const [jitsiUrl, setJitsiUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!section) { router.replace("/"); return; }
    if (booking?.status !== "paid") { router.replace(`/sections/${id}`); return; }

    // Fetch JWT from backend then build authenticated Jitsi URL
    getJitsiToken(id)
      .then(({ token, roomId }) => {
        setJitsiUrl(`${JITSI_BASE_URL}/${roomId}?jwt=${token}`);
      })
      .catch(() => {
        // Fall back to unauthenticated join if token fetch fails
        setJitsiUrl(`${JITSI_BASE_URL}/section-${id}`);
      });
  }, [section, booking, id, router]);

  if (!section || booking?.status !== "paid") return null;

  return (
    <View className="flex-1 bg-background px-4 pt-4">
      <Text className="text-xl font-bold text-foreground mb-3">
        Live Class — {section.title}
      </Text>

      <View className="flex-row gap-2 mb-3">
        {TABS.map(({ id: t, label }) => (
          <Pressable
            key={t}
            className={`flex-1 py-2.5 rounded-lg items-center ${
              tab === t ? "bg-primary" : "bg-secondary"
            }`}
            onPress={() => setTab(t)}
          >
            <Text
              className={`text-xs font-semibold ${
                tab === t ? "text-primary-foreground" : "text-secondary-foreground"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "video" && (
        <View className="flex-1 rounded-xl overflow-hidden border border-border">
          {jitsiUrl ? (
            <WebView
              source={{ uri: jitsiUrl }}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              className="flex-1"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" />
              <Text className="text-muted-foreground text-sm mt-2">Connecting…</Text>
            </View>
          )}
        </View>
      )}
      {tab === "whiteboard" && (
        <ScrollView contentContainerClassName="pb-8">
          <WhiteboardPanel sectionSessionId={section.id} />
        </ScrollView>
      )}
      {tab === "highlight" && (
        <ScrollView contentContainerClassName="pb-8">
          <DocumentHighlightPanel sectionSessionId={section.id} />
        </ScrollView>
      )}
    </View>
  );
}
