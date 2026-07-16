/**
 * Reusable, side-effect-free formatters. Each takes raw input and returns a
 * display or normalized string; they never touch React or the DOM so they can
 * be unit-tested in isolation.
 */

/** Strip everything but digits. */
export function digitsOf(input: string): string {
  return input.replace(/\D/g, '')
}

/**
 * Lowercase and drop any character outside `[a-z0-9._]`. Applied on every
 * keystroke so the username field can only ever hold a valid-shaped value.
 * The dot is allowed because the data contract uses it as a login separator
 * (e.g. `ada.lovelace`); spaces, uppercase and other symbols are stripped.
 */
export function formatUsername(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9._]/g, '')
}

/**
 * Reduce arbitrary phone input to its 10 national digits, prefix/country-code
 * agnostic. Handles the seed data's `+1-202-…` numbers and RU `8…`/`+7…`
 * equally by keeping the trailing 10 digits.
 */
export function nationalPhoneDigits(input: string): string {
  let d = digitsOf(input)
  if (d.length === 11 && (d[0] === '7' || d[0] === '8')) d = d.slice(1)
  else if (d.length > 10) d = d.slice(-10)
  return d.slice(0, 10)
}

/** Number of national digits captured — 10 means a complete number. */
export const PHONE_LENGTH = 10

/**
 * Progressive `+7 (999) 999-99-99` mask. Returns '' for empty input so the
 * field can show its placeholder instead of a lone `+7`.
 */
export function formatPhone(input: string): string {
  const d = nationalPhoneDigits(input)
  if (d.length === 0) return ''
  let out = `+7 (${d.slice(0, 3)}`
  if (d.length > 3) out += `) ${d.slice(3, 6)}`
  if (d.length > 6) out += `-${d.slice(6, 8)}`
  if (d.length > 8) out += `-${d.slice(8, 10)}`
  return out
}

/**
 * Normalized, storage-facing phone: `+7XXXXXXXXXX`. Returns '' when the number
 * is incomplete so callers never persist a half-typed value.
 */
export function normalizePhone(input: string): string {
  const d = nationalPhoneDigits(input)
  return d.length === PHONE_LENGTH ? `+7${d}` : ''
}

/**
 * List-facing phone display: masks values already in normalized `+7XXXXXXXXXX`
 * form, and shows any other stored value (e.g. the seed `+1-…` numbers) as-is
 * rather than mangling it into the RU mask.
 */
export function displayPhone(stored: string): string {
  return /^\+7\d{10}$/.test(stored) ? formatPhone(stored) : stored
}
