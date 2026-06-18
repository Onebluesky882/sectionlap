import type { FormEvent } from "react";
import type { SectionFormValues } from "../hooks/useSectionForm";
<<<<<<< HEAD
=======
import { Button } from "./ui/button";
>>>>>>> wansing

interface Props {
  mode: "new" | "edit";
  values: SectionFormValues;
  onChange: (values: SectionFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

<<<<<<< HEAD
=======
const inputClass =
  "bg-input/30 border border-border rounded-md text-foreground px-2 py-2 text-sm";
const labelClass = "flex flex-col gap-1 text-sm";

>>>>>>> wansing
export function SectionForm({ mode, values, onChange, onSubmit, onCancel }: Props) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
<<<<<<< HEAD
    <form className="section-form" onSubmit={handleSubmit}>
      <h3>{mode === "new" ? "New Section" : "Edit Section"}</h3>
      <label>
        Title
        <input
=======
    <form
      className="bg-card border border-border rounded-lg p-6 my-4 text-left max-w-2xl flex flex-col gap-3"
      onSubmit={handleSubmit}
    >
      <h3 className="text-lg font-semibold">{mode === "new" ? "New Section" : "Edit Section"}</h3>
      <label className={labelClass}>
        Title
        <input
          className={inputClass}
>>>>>>> wansing
          required
          value={values.title}
          onChange={(e) => onChange({ ...values, title: e.target.value })}
        />
      </label>
<<<<<<< HEAD
      <label>
        Description
        <textarea
=======
      <label className={labelClass}>
        Description
        <textarea
          className={inputClass}
>>>>>>> wansing
          required
          value={values.description}
          onChange={(e) => onChange({ ...values, description: e.target.value })}
        />
      </label>
<<<<<<< HEAD
      <div className="form-row">
        <label>
          Teacher
          <input
=======
      <div className="flex gap-4">
        <label className={`${labelClass} flex-1`}>
          Teacher
          <input
            className={inputClass}
>>>>>>> wansing
            required
            value={values.teacher}
            onChange={(e) => onChange({ ...values, teacher: e.target.value })}
          />
        </label>
<<<<<<< HEAD
        <label>
          Category
          <input
=======
        <label className={`${labelClass} flex-1`}>
          Category
          <input
            className={inputClass}
>>>>>>> wansing
            required
            value={values.category}
            onChange={(e) => onChange({ ...values, category: e.target.value })}
          />
        </label>
      </div>
<<<<<<< HEAD
      <div className="form-row">
        <label>
          Price ($)
          <input
=======
      <div className="flex gap-4">
        <label className={`${labelClass} flex-1`}>
          Price ($)
          <input
            className={inputClass}
>>>>>>> wansing
            required
            type="number"
            min="0"
            value={values.price}
            onChange={(e) => onChange({ ...values, price: e.target.value })}
          />
        </label>
<<<<<<< HEAD
        <label>
          Duration (minutes)
          <input
=======
        <label className={`${labelClass} flex-1`}>
          Duration (minutes)
          <input
            className={inputClass}
>>>>>>> wansing
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
<<<<<<< HEAD
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Save
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
=======
      <div className="flex gap-4">
        <label className={`${labelClass} flex-1`}>
          Capacity (seats)
          <input
            className={inputClass}
            required
            type="number"
            min="1"
            value={values.capacity}
            onChange={(e) => onChange({ ...values, capacity: e.target.value })}
          />
        </label>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
>>>>>>> wansing
      </div>
    </form>
  );
}
