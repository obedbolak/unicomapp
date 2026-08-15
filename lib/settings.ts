// lib/settings.ts
// Typed access to the Setting key/value table.
//
// Every key has a default here, so a fresh database (or a key nobody has ever
// saved) still returns a usable value — pages never have to null-check.

import { prisma } from "@/lib/prisma";

export const SETTING_DEFAULTS = {
  companyName: "UnicomTeam",
  companyEmail: "contact@unicomteam.com",
  companyPhone: "681529488",
  companyAddress: "",
  /** Shown on /admin/payments as the number students send MoMo to. */
  momoNumber: "681529488",
  orangeMoneyNumber: "",
  currency: "XAF",
  invoicePrefix: "UCT-INV",
  certificatePrefix: "UCT",
  /** Registration fee quoted to new enrollments, in the currency above. */
  registrationFee: "5000",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type Settings = Record<SettingKey, string>;

export const SETTING_KEYS = Object.keys(SETTING_DEFAULTS) as SettingKey[];

/** Reads every setting, filling in defaults for keys that were never saved. */
export async function getSettings(): Promise<Settings> {
  const rows = await prisma.setting
    .findMany({ where: { key: { in: SETTING_KEYS } } })
    .catch(() => [] as { key: string; value: string }[]);

  const saved = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return Object.fromEntries(
    SETTING_KEYS.map((key) => [key, saved[key] ?? SETTING_DEFAULTS[key]]),
  ) as Settings;
}

/** Reads one setting. Prefer getSettings() when you need more than two. */
export async function getSetting(key: SettingKey): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? SETTING_DEFAULTS[key];
}

/** Upserts the given keys. Unknown keys are ignored rather than stored. */
export async function saveSettings(values: Partial<Settings>): Promise<void> {
  const entries = Object.entries(values).filter(
    ([key, value]) =>
      SETTING_KEYS.includes(key as SettingKey) && typeof value === "string",
  ) as [SettingKey, string][];

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: value.slice(0, 500) },
        update: { value: value.slice(0, 500) },
      }),
    ),
  );
}
