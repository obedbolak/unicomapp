// components/dashboard/ProjectFields.tsx
// The project field set, shared by "Add a project" and the manage panel's edit
// form. One definition so the two can never drift apart — a field added for
// creating is a field you can also edit, without anyone having to remember.
//
// Not a <form> itself: the caller wraps it in one and supplies the action, so
// the same fields serve createProject and updateProject.

import type { ProjectCategory, ProjectStatus } from "@prisma/client";

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "SOFTWARE_DEVELOPMENT",
  "MOBILE_WEB_APP",
  "DIGITAL_MARKETING",
  "SOCIAL_MEDIA",
  "BUSINESS_STRATEGY",
];

export const PROJECT_STATUSES: ProjectStatus[] = [
  "PLANNING",
  "IN_PROGRESS",
  "REVIEW",
  "DELIVERED",
  "MAINTENANCE",
  "ON_HOLD",
  "CANCELLED",
];

export function humanise(value: string) {
  const lower = value.replace(/_/g, " ").toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** <input type="date"> wants YYYY-MM-DD and nothing else. */
export function dateInputValue(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export type ProjectDefaults = {
  title: string;
  description: string;
  longDescription: string | null;
  category: ProjectCategory;
  status: ProjectStatus;
  tags: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  coverImage: string | null;
  clientId: string | null;
  leadId: string | null;
  budget: string | null;
  currency: string;
  startDate: Date | null;
  dueDate: Date | null;
  published: boolean;
  featured: boolean;
};

type Option = { id: string; label: string };

export default function ProjectFields({
  defaults,
  clients,
  leads,
  idPrefix,
}: {
  defaults?: ProjectDefaults;
  clients: Option[];
  leads: Option[];
  /** Keeps checkbox ids unique when several of these render on one page. */
  idPrefix: string;
}) {
  const d = defaults;

  return (
    <>
      <div className="dash-formgrid">
        <label>
          <span className="dash-field-label">Title</span>
          <input
            name="title"
            required
            maxLength={120}
            defaultValue={d?.title ?? ""}
            placeholder="Gracy Global marketplace"
            className="dash-input"
          />
        </label>

        <label>
          <span className="dash-field-label">Category</span>
          <select
            name="category"
            defaultValue={d?.category ?? "SOFTWARE_DEVELOPMENT"}
            className="dash-select"
          >
            {PROJECT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {humanise(c)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="dash-field-label">Status</span>
          <select
            name="status"
            defaultValue={d?.status ?? "PLANNING"}
            className="dash-select"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanise(s)}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="dash-field-label">Client</span>
          <select
            name="clientId"
            defaultValue={d?.clientId ?? ""}
            className="dash-select"
          >
            <option value="">No client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="dash-field-label">Lead</span>
          <select
            name="leadId"
            defaultValue={d?.leadId ?? ""}
            className="dash-select"
          >
            <option value="">Nobody yet</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="dash-field-label">Budget</span>
          <input
            type="number"
            name="budget"
            min={0}
            step={1}
            defaultValue={d?.budget ?? ""}
            placeholder="750000"
            className="dash-input"
          />
        </label>

        <label>
          <span className="dash-field-label">Currency</span>
          <input
            name="currency"
            maxLength={6}
            defaultValue={d?.currency ?? "XAF"}
            className="dash-input"
          />
        </label>

        <label>
          <span className="dash-field-label">Start date</span>
          <input
            type="date"
            name="startDate"
            defaultValue={dateInputValue(d?.startDate)}
            className="dash-input"
          />
        </label>

        <label>
          <span className="dash-field-label">Due date</span>
          <input
            type="date"
            name="dueDate"
            defaultValue={dateInputValue(d?.dueDate)}
            className="dash-input"
          />
        </label>
      </div>

      <div style={{ marginTop: "0.9rem", display: "grid", gap: "0.9rem" }}>
        <label>
          <span className="dash-field-label">
            Short description — the blurb on the public card
          </span>
          <input
            name="description"
            required
            maxLength={300}
            defaultValue={d?.description ?? ""}
            placeholder="A multi-vendor marketplace for Cameroonian sellers."
            className="dash-input"
          />
        </label>

        <label>
          <span className="dash-field-label">Full description</span>
          <textarea
            name="longDescription"
            rows={4}
            maxLength={4000}
            defaultValue={d?.longDescription ?? ""}
            placeholder="What was built, the problem it solves, how it went."
            className="dash-input"
            style={{ resize: "vertical", fontFamily: "inherit" }}
          />
        </label>
      </div>

      <div className="dash-formgrid" style={{ marginTop: "0.9rem" }}>
        <label>
          <span className="dash-field-label">Tags — comma separated</span>
          <input
            name="tags"
            defaultValue={d?.tags.join(", ") ?? ""}
            placeholder="Next.js, TypeScript, Prisma"
            className="dash-input"
          />
        </label>

        <label>
          <span className="dash-field-label">Live URL</span>
          <input
            name="liveUrl"
            type="url"
            defaultValue={d?.liveUrl ?? ""}
            placeholder="https://example.com"
            className="dash-input"
          />
        </label>

        <label>
          <span className="dash-field-label">Repo URL</span>
          <input
            name="repoUrl"
            type="url"
            defaultValue={d?.repoUrl ?? ""}
            placeholder="https://github.com/…"
            className="dash-input"
          />
        </label>

        <label>
          <span className="dash-field-label">Cover image URL</span>
          <input
            name="coverImage"
            defaultValue={d?.coverImage ?? ""}
            placeholder="/projects/cover.png"
            className="dash-input"
          />
        </label>
      </div>

      <div
        style={{
          marginTop: "0.9rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.25rem",
          alignItems: "center",
        }}
      >
        <label
          htmlFor={`${idPrefix}-published`}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <input
            id={`${idPrefix}-published`}
            type="checkbox"
            name="published"
            defaultChecked={d?.published ?? false}
          />
          <span className="dash-field-label" style={{ margin: 0 }}>
            Show on the public /projects page
          </span>
        </label>

        <label
          htmlFor={`${idPrefix}-featured`}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <input
            id={`${idPrefix}-featured`}
            type="checkbox"
            name="featured"
            defaultChecked={d?.featured ?? false}
          />
          <span className="dash-field-label" style={{ margin: 0 }}>
            Feature it
          </span>
        </label>
      </div>
    </>
  );
}
