import { FlatList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "../../src/store/useAppStore";
import { SectionCard } from "../../src/components/SectionCard";

export default function BrowseSectionsPage() {
  const sections = useAppStore((s) => s.sections);
  const bookings = useAppStore((s) => s.bookings);
  const router = useRouter();

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerClassName="max-w-3xl w-full mx-auto px-6 py-6"
      data={sections}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View className="mb-4">
          <Text className="text-3xl font-bold text-foreground">Browse Sections</Text>
          <Text className="text-base text-muted-foreground mt-1">
            Pick the sections you need — pay only for what you use.
          </Text>
        </View>
      }
      ListEmptyComponent={
        <Text className="text-muted-foreground">No sections available.</Text>
      }
      renderItem={({ item }) => (
        <SectionCard
          section={item}
          actionLabel="View Details"
          onAction={() => router.push(`/sections/${item.id}`)}
          enrolledCount={
            bookings.filter((b) => b.sectionId === item.id && b.status !== "failed").length
          }
        />
      )}
    />
  );
}
