/**
 * Reusable synchronous field validators. Each returns an i18n message *key*
 * (resolved by the strings module) or `null` when the value is valid — keeping
 * validation logic free of user-facing copy.
 */
import { nationalPhoneDigits, PHONE_LENGTH } from './formatters'

export type ValidationKey = string | null

const NAME_RE = /^[\p{L} -]+$/u
const USERNAME_RE = /^[a-z0-9._]+$/
// Pragmatic email shape check (format only; uniqueness is checked server-side).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateName(value: string): ValidationKey {
  const v = value.trim()
  if (!v) return 'error.name.required'
  if (v.length < 2 || v.length > 50) return 'error.name.length'
  if (!NAME_RE.test(v)) return 'error.name.chars'
  return null
}

export function validateUsername(value: string): ValidationKey {
  if (!value) return 'error.username.required'
  if (!USERNAME_RE.test(value)) return 'error.username.chars'
  return null
}

export function validateEmail(value: string): ValidationKey {
  const v = value.trim()
  if (!v) return 'error.email.required'
  if (!EMAIL_RE.test(v)) return 'error.email.format'
  return null
}

export function validatePhone(value: string): ValidationKey {
  if (!value.trim()) return 'error.phone.required'
  if (nationalPhoneDigits(value).length !== PHONE_LENGTH)
    return 'error.phone.incomplete'
  return null
}

export function validateRole(value: string): ValidationKey {
  if (!value) return 'error.role.required'
  return null
}

/** Avatar is optional; when present it must be a valid http(s) URL. */
export function validateAvatar(value: string): ValidationKey {
  const v = value.trim()
  if (!v) return null
  try {
    const url = new URL(v)
    if (url.protocol !== 'http:' && url.protocol !== 'https:')
      return 'error.avatar.url'
    return null
  } catch {
    return 'error.avatar.url'
  }
}
