"use client";

// components/dashboard/StatusSelect.tsx
// A status dropdown that saves the moment you pick something.
//
// The plain server-action version needed a separate button press, which reads
// as broken: the select shows the new value straight away, so nothing tells you
// the change never left the browser. Submitting on change removes the gap
// between what the control says and what the database holds.
//
// The button is kept as a fallback for when the client bundle hasn't loaded.
// Submitting twice is harmless — the action writes the same value either way.

import { useFormStatus } from "react-dom";

type Option = { value: string; label: string };

function Control({
  current,
  options,
  buttonLabel,
}: {
  current: string;
  options: Option[];
  buttonLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <select
        name="status"
        // Remounts when the saved value changes, so an uncontrolled select can
        // never sit there showing a value the server rejected or altered.
        key={current}
        defaultValue={current}
        disabled={pending}
        className="dash-select"
        style={{ width: "auto" }}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {pending ? (
        <span
          className="dash-td-muted"
          style={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}
        >
          Saving…
        </span>
      ) : (
        <button type="submit" className="dash-btn">
          {buttonLabel}
        </button>
      )}
    </>
  );
}

export default function StatusSelect({
  id,
  current,
  options,
  action,
  buttonLabel = "Save",
  idField = "id",
}: {
  id: string;
  current: string;
  options: Option[];
  /** Server action, passed down from the server component that renders this. */
  action: (formData: FormData) => void | Promise<void>;
  buttonLabel?: string;
  idField?: string;
}) {
  return (
    <form action={action} className="dash-inline-form">
      <input type="hidden" name={idField} value={id} />
      <Control current={current} options={options} buttonLabel={buttonLabel} />
    </form>
  );
}
