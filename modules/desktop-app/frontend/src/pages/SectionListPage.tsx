import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { SectionCard } from "../components/SectionCard";

export function SectionListPage() {
  const sections = useAppStore((state) => state.sections);
  const bookings = useAppStore((state) => state.bookings);
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Browse Sections</h1>
      <p className="text-muted-foreground mb-6">
        Pick the sections you need — pay only for what you use.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            actionLabel="View Details"
            onAction={() => navigate(`/sections/${section.id}`)}
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
