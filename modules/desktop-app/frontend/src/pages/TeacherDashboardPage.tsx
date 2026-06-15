import { useSectionForm } from "../hooks/useSectionForm";
import { SectionCard } from "../components/SectionCard";
import { SectionForm } from "../components/SectionForm";
import { useAppStore } from "../store/useAppStore";

export function TeacherDashboardPage() {
  const currentUser = useAppStore((state) => state.currentUser);
  const bookings = useAppStore((state) => state.bookings);
  const { sections, editingId, values, setValues, startCreate, startEdit, cancel, submit } =
    useSectionForm();

  if (currentUser.role !== "teacher") {
    return (
      <div className="page">
        <h1>Teacher Dashboard</h1>
        <div className="note">
          Switch to the teacher role (top right) to manage your sections.
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Teacher Dashboard</h1>
      <p className="subtitle">Post and manage the sections you teach.</p>

      {editingId === null && (
        <button className="btn btn-primary" onClick={startCreate}>
          + Post New Section
        </button>
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

      <h2>Your Sections</h2>
      <div className="card-grid">
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
