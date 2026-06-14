import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { SectionCard } from "../components/SectionCard";

export function SectionListPage() {
  const sections = useAppStore((state) => state.sections);
  const navigate = useNavigate();

  return (
    <div className="page">
      <h1>Browse Sections</h1>
      <p className="subtitle">
        Pick the sections you need — pay only for what you use.
      </p>
      <div className="card-grid">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            actionLabel="View Details"
            onAction={() => navigate(`/sections/${section.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
