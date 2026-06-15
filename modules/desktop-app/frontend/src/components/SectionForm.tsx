import type { FormEvent } from "react";
import type { SectionFormValues } from "../hooks/useSectionForm";

interface Props {
  mode: "new" | "edit";
  values: SectionFormValues;
  onChange: (values: SectionFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function SectionForm({ mode, values, onChange, onSubmit, onCancel }: Props) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form className="section-form" onSubmit={handleSubmit}>
      <h3>{mode === "new" ? "New Section" : "Edit Section"}</h3>
      <label>
        Title
        <input
          required
          value={values.title}
          onChange={(e) => onChange({ ...values, title: e.target.value })}
        />
      </label>
      <label>
        Description
        <textarea
          required
          value={values.description}
          onChange={(e) => onChange({ ...values, description: e.target.value })}
        />
      </label>
      <div className="form-row">
        <label>
          Teacher
          <input
            required
            value={values.teacher}
            onChange={(e) => onChange({ ...values, teacher: e.target.value })}
          />
        </label>
        <label>
          Category
          <input
            required
            value={values.category}
            onChange={(e) => onChange({ ...values, category: e.target.value })}
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Price ($)
          <input
            required
            type="number"
            min="0"
            value={values.price}
            onChange={(e) => onChange({ ...values, price: e.target.value })}
          />
        </label>
        <label>
          Duration (minutes)
          <input
            required
            type="number"
            min="0"
            value={values.durationMinutes}
            onChange={(e) =>
              onChange({ ...values, durationMinutes: e.target.value })
            }
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Capacity (seats)
          <input
            required
            type="number"
            min="1"
            value={values.capacity}
            onChange={(e) => onChange({ ...values, capacity: e.target.value })}
          />
        </label>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
