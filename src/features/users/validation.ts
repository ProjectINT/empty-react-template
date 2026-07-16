/**
 * Reusable formatters, normalisers and validators for user fields.
 *
 * These are pure, framework-agnostic units. They are the single source of truth
 * for the field rules and are consumed in two places:
 *   - the Palistor config (`formatter` / `validate`) — the model layer;
 *   - the edit dialog — for live blur/submit display and the save gate.
 *
 * A validator returns a localized error string, or `undefined` when the value
 * is valid.
 */
import { t } from "./i18n";
import type { UserFormValues } from "./types";

// ─── Formatters (applied as the user types) ──────────────────────────────────

/** Lowercase and strip anything that is not `[a-z0-9_]`. */
export function formatUsername(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
}

/** Digits of a phone, forced to a leading country code `1`, capped at 11. */
function phoneDigits(value: unknown): string {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.startsWith("8")) digits = "1" + digits.slice(1);
  if (!digits.startsWith("1")) digits = "1" + digits;
  return digits.slice(0, 11);
}

/**
 * Progressive phone mask `+1 (999) 999-9999`.
 * Formats whatever digits are present so it works while typing.
 */
export function formatPhone(value: unknown): string {
  const d = phoneDigits(value);
  const rest = d.slice(1); // drop the country code for grouping
  let out = "+1";
  if (rest.length > 0) out += " (" + rest.slice(0, 3);
  if (rest.length >= 3) out += ")";
  if (rest.length > 3) out += " " + rest.slice(3, 6);
  if (rest.length > 6) out += "-" + rest.slice(6, 8);
  if (rest.length > 8) out += "-" + rest.slice(8, 10);
  return out;
}

/** Canonical, data-facing phone form: `+1XXXXXXXXXX`. */
export function normalizePhone(value: unknown): string {
  return "+" + phoneDigits(value);
}

/** True when the phone holds a complete 11-digit number. */
export function isPhoneComplete(value: unknown): boolean {
  return phoneDigits(value).length === 11;
}

// ─── Validators ──────────────────────────────────────────────────────────────

// Unicode letters, marks, spaces and hyphens only — no digits.
const NAME_RE = /^[\p{L}\p{M} -]+$/u;
// Pragmatic email check (format only; uniqueness is verified on the server).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value: unknown): string | undefined {
  const v = String(value ?? "").trim();
  if (!v) return t("users.valid.required");
  if (!NAME_RE.test(v)) return t("users.valid.nameChars");
  if (v.length < 2 || v.length > 50) return t("users.valid.nameLength");
  return undefined;
}

export function validateUsername(value: unknown): string | undefined {
  const v = String(value ?? "");
  if (!v) return t("users.valid.required");
  if (!/^[a-z0-9_]+$/.test(v)) return t("users.valid.usernameChars");
  if (v.length < 3) return t("users.valid.usernameLength");
  return undefined;
}

export function validateEmail(value: unknown): string | undefined {
  const v = String(value ?? "").trim();
  if (!v) return t("users.valid.required");
  if (!EMAIL_RE.test(v)) return t("users.valid.emailFormat");
  return undefined;
}

export function validatePhone(value: unknown): string | undefined {
  const v = String(value ?? "").trim();
  if (!v) return t("users.valid.required");
  if (!isPhoneComplete(v)) return t("users.valid.phoneIncomplete");
  return undefined;
}

export function validateRole(value: unknown): string | undefined {
  if (!String(value ?? "")) return t("users.valid.required");
  return undefined;
}

export function validateAvatar(value: unknown): string | undefined {
  const v = String(value ?? "").trim();
  if (!v) return undefined; // optional
  try {
    const url = new URL(v);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return t("users.valid.avatarUrl");
    }
  } catch {
    return t("users.valid.avatarUrl");
  }
  return undefined;
}

/**
 * Synchronous validity of every editable field, keyed by field name.
 * Async uniqueness (username/email) is layered on top by the dialog.
 */
export function validateForm(
  values: UserFormValues,
): Partial<Record<keyof UserFormValues, string>> {
  return {
    name: validateName(values.name),
    username: validateUsername(values.username),
    email: validateEmail(values.email),
    phone: validatePhone(values.phone),
    role: validateRole(values.role),
    avatar: validateAvatar(values.avatar),
  };
}
