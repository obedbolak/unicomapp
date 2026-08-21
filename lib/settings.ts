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
  /**
   * Authorized share capital — the ceiling on how many company shares exist.
   * Ownership percentages are calculated against shares actually issued; this
   * is here so the cap table can show how much is still unallocated.
   */
  authorizedShares: "1000",
  /**
   * What the company is currently valued at, in the currency above. Used to
   * express a shareholding in money: value = ownership%  ×  valuation.
   * Leave at 0 and the wallet shows shares and percentage only.
   */
  companyValuation: "0",
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

/**
 * Reads one setting. Prefer getSettings() when you need more than two.
 *
 * Falls back to the default on any error rather than throwing. A configuration
 * value should never be the reason a page fails to render — if the database is
 * briefly unreachable, a sensible default beats a crash.
 */
export async function getSetting(key: SettingKey): Promise<string> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    return row?.value ?? SETTING_DEFAULTS[key];
  } catch (err) {
    console.warn(
      `[settings] could not read "${key}", using the default:`,
      err instanceof Error ? err.message : err,
    );
    return SETTING_DEFAULTS[key];
  }
}

/** Upserts the given keys. Unknown keys are ignored rather than stored. */
export async function saveSettings(values: Partial<Settings>): Promise<void> {
  const entries = Object.entries(values).filter(
    ([key, value]) =>
      SETTING_KEYS.includes(key as SettingKey) && typeof value === "string",
  ) as [SettingKey, string][];

  // Sequential, not a transaction. Each key is independent, so atomicity buys
  // nothing here — and wrapping a dozen upserts in $transaction needs a
  // dedicated pooled connection, which times out against Neon's pooler under
  // any real concurrency ("Unable to start a transaction in the given time").
  //
  // Sequential rather than Promise.all for the same reason: a burst of
  // parallel writes is what saturates the pool in the first place.
  for (const [key, value] of entries) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: value.slice(0, 500) },
      update: { value: value.slice(0, 500) },
    });
  }
}
