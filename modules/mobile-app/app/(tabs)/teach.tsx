import { FlatList, Text, View } from "react-native";
import { useAppStore } from "../../src/store/useAppStore";
import { useSectionForm } from "../../src/hooks/useSectionForm";
import { SectionCard } from "../../src/components/SectionCard";
import { SectionForm } from "../../src/components/SectionForm";
import { Button } from "../../src/components/Button";

export default function TeacherDashboardPage() {
  const currentUser = useAppStore((s) => s.currentUser);
  const bookings = useAppStore((s) => s.bookings);
  const { sections, editingId, values, setValues, startCreate, startEdit, cancel, submit } =
    useSectionForm();

  if (!currentUser || currentUser.role !== "teacher") {
    return (
      <View className="flex-1 bg-background px-6 py-6">
        <Text className="text-3xl font-bold text-foreground">Teacher Dashboard</Text>
        <Text className="text-muted-foreground mt-3">
          Sign in as a Teacher to manage your sections.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerClassName="max-w-3xl w-full mx-auto px-6 py-6"
      data={sections}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <Text className="text-3xl font-bold text-foreground">Teacher Dashboard</Text>
          <Text className="text-base text-muted-foreground mt-1 mb-4">
            Post and manage the sections you teach.
          </Text>

          {editingId === null && (
            <Button onPress={startCreate} className="mb-4">
              + Post New Section
            </Button>
          )}

          {editingId !== null && (
            <SectionForm
              mode={editingId === "new" ? "new" : "edit"}
              values={values}
              onChange={setValues}
              onSubmit={submit}
              onCancel={cancel}
            />
          )}

          <Text className="text-xl font-bold text-foreground mb-3 mt-2">Your Sections</Text>
        </View>
      }
      ListEmptyComponent={
        <Text className="text-muted-foreground">No sections yet. Post one above.</Text>
      }
      renderItem={({ item }) => (
        <SectionCard
          section={item}
          actionLabel="Edit"
          onAction={() => startEdit(item)}
          enrolledCount={
            bookings.filter((b) => b.sectionId === item.id && b.status !== "failed").length
          }
        />
      )}
    />
  );
}
