"use client";

// Client component purely so the "Generate" button can fill the password box
// and the admin can read it once before handing it over.
//
// There is no email sender wired up, so the password has to be visible at
// creation time — otherwise the admin has no way to tell the new person what
// it is. It is hashed with bcrypt the moment the form is submitted.

import { useState } from "react";
import { createTeamMember } from "@/app/admin/team-actions";

function generatePassword() {
  // Ambiguous characters left out — these get read aloud and retyped.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(bytes, (n) => alphabet[n % alphabet.length]).join("");
}

export default function NewMemberForm() {
  const [password, setPassword] = useState("");

  return (
    <form action={createTeamMember}>
      <div className="dash-formgrid">
        <label>
          <span className="dash-field-label">Full name</span>
          <input
            name="name"
            required
            maxLength={120}
            placeholder="Alvine Malyka"
            className="dash-input"
          />
        </label>

        <label>
          <span className="dash-field-label">Email</span>
          <input
            type="email"
            name="email"
            required
            maxLength={160}
            placeholder="alvine@unicomteam.com"
            className="dash-input"
          />
        </label>

        <label>
          <span className="dash-field-label">Job title</span>
          <input
            name="title"
            maxLength={120}
            placeholder="Core Systems Engineer"
            className="dash-input"
          />
        </label>

        <label>
          <span className="dash-field-label">Department</span>
          <select name="department" className="dash-select">
            <option value="">None</option>
            <option value="ENGINEERING">Engineering</option>
            <option value="DESIGN">Design</option>
            <option value="GROWTH">Growth</option>
            <option value="OPERATIONS">Operations</option>
          </select>
        </label>
      </div>

      <div
        className="dash-formgrid"
        style={{ marginTop: "0.85rem", alignItems: "end" }}
      >
        <label style={{ gridColumn: "span 2" }}>
          <span className="dash-field-label">Initial password</span>
          <input
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="dash-input"
            autoComplete="off"
          />
        </label>

        <button
          type="button"
          className="dash-btn"
          onClick={() => setPassword(generatePassword())}
        >
          Generate
        </button>

        <label className="dash-check" style={{ marginTop: 0 }}>
          <input type="checkbox" name="isAdmin" />
          <span>
            <strong>Make admin</strong>
            <em>Full access to /admin, not just their own work.</em>
          </span>
        </label>
      </div>

      {password && (
        <p className="dash-hint" style={{ color: "var(--color-primary)" }}>
          Copy this password now and send it to them — it is hashed on save and
          cannot be shown again. They can change it from their Profile page.
        </p>
      )}

      <div className="dash-actions">
        <button type="submit" className="dash-btn dash-btn--primary">
          Create account
        </button>
      </div>
    </form>
  );
}
