import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSection } from "../../../src/hooks/useSection";
import { useAppStore } from "../../../src/store/useAppStore";
import { Button } from "../../../src/components/Button";
import { Badge } from "../../../src/components/Badge";
import { Card } from "../../../src/components/Card";

export default function SectionDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { section, booking } = useSection(id);
  const bookings = useAppStore((s) => s.bookings);

  useEffect(() => {
    if (!section) router.replace("/");
  }, [section, router]);

  if (!section) return null;

  const activeCount = bookings.filter(
    (b) => b.sectionId === section.id && b.status !== "failed"
  ).length;
  const isFull = !booking && activeCount >= section.capacity;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="max-w-3xl w-full mx-auto px-6 py-6"
    >
      <Badge>{section.category}</Badge>
      <Text className="text-3xl font-bold text-foreground mt-2">{section.title}</Text>
      <Text className="text-sm text-muted-foreground mt-1">Taught by {section.teacher}</Text>
      <Text className="text-base text-foreground mt-3">{section.description}</Text>

      <Card className="mt-4 gap-1">
        <Text className="text-sm text-foreground">Duration: {section.durationMinutes} minutes</Text>
        <Text className="text-sm text-foreground">Price: ${section.price}</Text>
        <Text className="text-sm text-foreground">
          Seats: {activeCount}/{section.capacity}
        </Text>
      </Card>

      <View className="mt-4">
        {booking?.status === "paid" ? (
          <View className="bg-secondary rounded-xl p-4 gap-3">
            <Text className="text-foreground">✅ Enrolled — content unlock coming in a later stage.</Text>
            <Button onPress={() => router.push(`/sections/${section.id}/live-class`)}>
              Join Live Class
            </Button>
          </View>
        ) : isFull ? (
          <Text className="text-destructive font-medium">This section is full.</Text>
        ) : (
          <Button onPress={() => router.push(`/sections/${section.id}/checkout`)}>
            Book this Section
          </Button>
        )}
      </View>
    </ScrollView>
  );
}
