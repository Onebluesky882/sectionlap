import { FlatList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "../../src/store/useAppStore";
import { SectionCard } from "../../src/components/SectionCard";

export default function MyEnrollmentsPage() {
  const currentUser = useAppStore((s) => s.currentUser);
  const sections = useAppStore((s) => s.sections);
  const bookings = useAppStore((s) => s.bookings);
  const router = useRouter();

  const enrolled = sections.filter((section) =>
    bookings.some(
      (b) => b.sectionId === section.id && b.studentId === currentUser.id && b.status === "paid"
    )
  );

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerClassName="max-w-3xl w-full mx-auto px-6 py-6"
      data={enrolled}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View className="mb-4">
          <Text className="text-3xl font-bold text-foreground">My Enrollments</Text>
          <Text className="text-base text-muted-foreground mt-1">
            Sections you've paid for and unlocked.
          </Text>
        </View>
      }
      ListEmptyComponent={
        <Text className="text-muted-foreground">
          You haven't enrolled in any sections yet. Browse sections to get started.
        </Text>
      }
      renderItem={({ item }) => (
        <SectionCard
          section={item}
          actionLabel="Join Live Class"
          onAction={() => router.push(`/sections/${item.id}/live-class`)}
        />
      )}
    />
  );
}
