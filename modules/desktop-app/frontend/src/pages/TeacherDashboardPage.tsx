import { useSectionForm } from "../hooks/useSectionForm";
import { SectionCard } from "../components/SectionCard";
import { SectionForm } from "../components/SectionForm";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/button";

export function TeacherDashboardPage() {
  const currentUser = useAppStore((state) => state.currentUser);
  const bookings = useAppStore((state) => state.bookings);
  const { sections, editingId, values, setValues, startCreate, startEdit, cancel, submit } =
    useSectionForm();

  if (currentUser.role !== "teacher") {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
        <div className="text-muted-foreground text-sm mt-4">
          Switch to the teacher role (top right) to manage your sections.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
      <p className="text-muted-foreground mb-6">Post and manage the sections you teach.</p>

      {editingId === null && (
        <Button onClick={startCreate}>+ Post New Section</Button>
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

      <h2 className="text-xl font-semibold mt-6">Your Sections</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            actionLabel="Edit"
            onAction={() => startEdit(section)}
            enrolledCount={
              bookings.filter(
                (b) => b.sectionId === section.id && b.status !== "failed"
              ).length
            }
          />
        ))}
      </div>
    </div>
  );
}
