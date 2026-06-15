import type { Section } from "../types";
import { Button } from "./ui/button";

interface Props {
  section: Section;
  actionLabel: string;
  onAction: () => void;
  enrolledCount?: number;
}

export function SectionCard({ section, actionLabel, onAction, enrolledCount }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-2 text-left">
      <div className="text-xs uppercase tracking-wide text-primary">{section.category}</div>
      <h3 className="text-lg font-semibold">{section.title}</h3>
      <p className="text-muted-foreground text-sm grow">{section.description}</p>
      <div className="flex justify-between text-sm">
        <span className="font-bold">${section.price}</span>
        <span className="text-muted-foreground">by {section.teacher}</span>
      </div>
      {enrolledCount !== undefined && (
        <div className="text-muted-foreground text-xs mb-2">
          {enrolledCount}/{section.capacity} seats booked
        </div>
      )}
      <Button onClick={onAction}>{actionLabel}</Button>
    </div>
  );
}
