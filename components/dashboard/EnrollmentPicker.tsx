"use client";

// components/dashboard/EnrollmentPicker.tsx
//
// The "Link to enrollment" dropdown on Issue a certificate. Choosing someone
// fills the rest of the form from their enrollment — name, type, programme,
// department and dates — so the admin only checks and presses Preview/Issue.
// It writes into the form's own inputs, so the page stays a server component.
// Anything the enrollment doesn't know (e.g. dates with no cohort) is left
// for the admin to type.

import { useState } from "react";

export type EnrollmentOption = {
  id: string;
  label: string;
  name: string;
  email?: string | null;
  type: "INTERNSHIP" | "TRAINING";
  program: string;
  department: string | null;
  periodStart: string | null; // yyyy-mm-dd
  periodEnd: string | null;
};

export default function EnrollmentPicker({
  options,
}: {
  options: EnrollmentOption[];
}) {
  const [note, setNote] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const form = e.currentTarget.form;
    const picked = options.find((o) => o.id === e.currentTarget.value);
    if (!form || !picked) {
      setNote("");
      return;
    }

    const set = (name: string, value: string | null) => {
      const el = form.elements.namedItem(name) as
        HTMLInputElement | HTMLSelectElement | null;
      if (el && value) el.value = value;
    };

    set("name", picked.name);
    set("email", picked.email ?? null);
    set("type", picked.type);
    set("program", picked.program);
    set("department", picked.department);
    set("periodStart", picked.periodStart);
    set("periodEnd", picked.periodEnd);

    const missing = [
      !picked.department && "department",
      !picked.periodStart && "start date",
      !picked.periodEnd && "end date",
    ].filter(Boolean);
    setNote(
      missing.length
        ? `Filled from the enrollment. Please add the ${missing.join(", ")}.`
        : "Filled from the enrollment — check it, then Preview.",
    );
  };

  return (
    <label>
      <span className="dash-field-label">Link to enrollment</span>
      <select
        name="enrollmentId"
        defaultValue=""
        className="dash-select"
        onChange={onChange}
      >
        <option value="">None</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      {note && (
        <span
          style={{
            display: "block",
            fontSize: "0.72rem",
            marginTop: "0.35rem",
            color: "var(--color-text-muted)",
          }}
        >
          {note}
        </span>
      )}
    </label>
  );
}
