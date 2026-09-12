import { useAppStore } from "../../store/useAppStore";
import { SectionCard } from "../../components/SectionCard";

export function MyEnrollmentsPage() {
  const currentUser = useAppStore((state) => state.currentUser);
  const sections = useAppStore((state) => state.sections);
  const bookings = useAppStore((state) => state.bookings);

  const enrolled = currentUser
    ? sections.filter((section) =>
        bookings.some(
          (b) =>
            b.sectionId === section.id &&
            b.studentId === currentUser.id &&
            b.status === "paid"
        )
      )
    : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">My Enrollments</h1>
      <p className="text-muted-foreground mb-6">Sections you've paid for and unlocked.</p>

      {enrolled.length === 0 ? (
        <div className="text-muted-foreground text-sm mt-4">
          You haven't enrolled in any sections yet. Browse sections to get
          started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {enrolled.map((section) => (
            // Disabled while switching video providers away from Jitsi
            // (modules/live-class) — route/screen still exist, just unlinked.
            <SectionCard
              key={section.id}
              section={section}
              actionLabel="Live Class (upgrading)"
              actionDisabled
              onAction={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
