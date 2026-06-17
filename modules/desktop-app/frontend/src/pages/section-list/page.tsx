import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { SectionCard } from "../../components/SectionCard";
import { Button } from "../../components/ui/button";

const CATEGORIES = ["All", "Frontend", "Backend", "DevOps", "Mobile", "Data Science", "Design"];

export function SectionListPage() {
  const sections = useAppStore((state) => state.sections);
  const bookings = useAppStore((state) => state.bookings);
  const categoryFilter = useAppStore((state) => state.categoryFilter);
  const setCategoryFilter = useAppStore((state) => state.setCategoryFilter);
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Browse Sections</h1>
      <p className="text-muted-foreground mb-4">
        Pick the sections you need — pay only for what you use.
      </p>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => {
          const value = cat === "All" ? "" : cat;
          const active = categoryFilter === value;
          return (
            <Button
              key={cat}
              variant={active ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(value)}
            >
              {cat}
            </Button>
          );
        })}
      </div>

      {sections.length === 0 ? (
        <p className="text-muted-foreground text-sm mt-8">No sections found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      )}
    </div>
  );
}
