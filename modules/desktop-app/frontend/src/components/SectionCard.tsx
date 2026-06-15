import type { Section } from "../types";

interface Props {
  section: Section;
  actionLabel: string;
  onAction: () => void;
  enrolledCount?: number;
}

export function SectionCard({ section, actionLabel, onAction, enrolledCount }: Props) {
  return (
    <div className="card">
      <div className="card-category">{section.category}</div>
      <h3>{section.title}</h3>
      <p className="card-description">{section.description}</p>
      <div className="card-footer">
        <span className="price">${section.price}</span>
        <span className="teacher">by {section.teacher}</span>
      </div>
      {enrolledCount !== undefined && (
        <div className="card-seats">
          {enrolledCount}/{section.capacity} seats booked
        </div>
      )}
      <button className="btn btn-primary" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  );
}
