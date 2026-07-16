import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { User, UserEditableFields } from './types'
import { useLazyCheckUniqueQuery } from './usersApi'
import { formatPhone, formatUsername, nationalPhoneDigits, normalizePhone } from './lib/formatters'
import {
  validateAvatar,
  validateEmail,
  validateName,
  validatePhone,
  validateRole,
  validateUsername,
  type ValidationKey,
} from './lib/validators'

/** Editable field identifiers. `phone` holds the *masked display* string. */
export type FieldName = keyof FormValues

interface FormValues {
  name: string
  username: string
  email: string
  /** Masked, human-readable phone (e.g. `+7 (999) 999-99-99`). */
  phone: string
  role: string
  avatar: string
}

type AsyncStatus = 'ok' | 'checking' | 'taken' | 'error'
type AsyncField = 'username' | 'email'

const FIELDS: FieldName[] = [
  'name',
  'username',
  'email',
  'phone',
  'role',
  'avatar',
]

const DEBOUNCE_MS = 450

/** Build the initial masked form values from a stored user. */
function toFormValues(user: User): FormValues {
  return {
    name: user.name,
    username: user.username,
    email: user.email,
    phone: formatPhone(user.phone),
    role: user.role,
    avatar: user.avatar ?? '',
  }
}

/** Normalize form values into the storage-facing shape used for diffing/saving. */
function toNormalized(values: FormValues): UserEditableFields {
  return {
    name: values.name.trim(),
    username: values.username,
    email: values.email.trim(),
    phone: normalizePhone(values.phone),
    role: values.role,
    avatar: values.avatar.trim(),
  }
}

function syncErrorOf(field: FieldName, values: FormValues): ValidationKey {
  switch (field) {
    case 'name':
      return validateName(values.name)
    case 'username':
      return validateUsername(values.username)
    case 'email':
      return validateEmail(values.email)
    case 'phone':
      return validatePhone(values.phone)
    case 'role':
      return validateRole(values.role)
    case 'avatar':
      return validateAvatar(values.avatar)
  }
}

/**
 * Owns all edit-form logic — formatting on input, sync validation, debounced
 * async uniqueness checks, dirty tracking and payload building. Kept out of the
 * view so the dialog is pure presentation.
 */
export function useUserForm(user: User) {
  const initial = useMemo(() => toFormValues(user), [user])
  const initialNormalized = useMemo(
    () => toNormalized(toFormValues(user)),
    [user],
  )

  const [values, setValues] = useState<FormValues>(initial)
  const [touched, setTouched] = useState<Record<FieldName, boolean>>(
    () => Object.fromEntries(FIELDS.map((f) => [f, false])) as Record<FieldName, boolean>,
  )
  const [submitAttempted, setSubmitAttempted] = useState(false)
  // Unchanged fields are unique by definition, so they start resolved.
  const [asyncStatus, setAsyncStatus] = useState<Record<AsyncField, AsyncStatus>>({
    username: 'ok',
    email: 'ok',
  })

  const [triggerCheck] = useLazyCheckUniqueQuery()
  const seqRef = useRef<Record<AsyncField, number>>({ username: 0, email: 0 })
  const timerRef = useRef<Partial<Record<AsyncField, ReturnType<typeof setTimeout>>>>({})

  useEffect(() => {
    const timers = timerRef.current
    return () => {
      if (timers.username) clearTimeout(timers.username)
      if (timers.email) clearTimeout(timers.email)
    }
  }, [])

  /** Debounced server-side uniqueness check for username/email. */
  const scheduleCheck = useCallback(
    (field: AsyncField, rawValue: string) => {
      if (timerRef.current[field]) clearTimeout(timerRef.current[field])

      const value = field === 'username' ? rawValue : rawValue.trim()
      const initialValue =
        field === 'username' ? initial.username : initial.email.trim()
      const syncError =
        field === 'username' ? validateUsername(value) : validateEmail(value)

      // Sync-invalid or unchanged → nothing to check; treat as resolved.
      if (syncError || value === initialValue) {
        setAsyncStatus((s) => ({ ...s, [field]: 'ok' }))
        return
      }

      setAsyncStatus((s) => ({ ...s, [field]: 'checking' }))
      const seq = ++seqRef.current[field]
      timerRef.current[field] = setTimeout(async () => {
        try {
          const conflicts = await triggerCheck(
            { field, value, excludeId: user.id },
            true,
          ).unwrap()
          if (seq !== seqRef.current[field]) return
          setAsyncStatus((s) => ({
            ...s,
            [field]: conflicts.length > 0 ? 'taken' : 'ok',
          }))
        } catch {
          if (seq !== seqRef.current[field]) return
          setAsyncStatus((s) => ({ ...s, [field]: 'error' }))
        }
      }, DEBOUNCE_MS)
    },
    [initial, triggerCheck, user.id],
  )

  const setField = useCallback(
    (field: FieldName, raw: string) => {
      setValues((prev) => {
        if (field === 'username') return { ...prev, username: formatUsername(raw) }
        if (field === 'phone') {
          const prevDigits = nationalPhoneDigits(prev.phone)
          let nextDigits = nationalPhoneDigits(raw)
          // Backspace landed on a mask separator: drop a real digit instead.
          if (raw.length < prev.phone.length && nextDigits === prevDigits) {
            nextDigits = nextDigits.slice(0, -1)
          }
          return { ...prev, phone: formatPhone(nextDigits) }
        }
        return { ...prev, [field]: raw }
      })

      if (field === 'username') scheduleCheck('username', formatUsername(raw))
      else if (field === 'email') scheduleCheck('email', raw)
    },
    [scheduleCheck],
  )

  const handleBlur = useCallback((field: FieldName) => {
    setTouched((t) => (t[field] ? t : { ...t, [field]: true }))
  }, [])

  /** Message key to display for a field, honoring touched / submit state. */
  const errorOf = useCallback(
    (field: FieldName): ValidationKey => {
      if (!touched[field] && !submitAttempted) return null
      const sync = syncErrorOf(field, values)
      if (sync) return sync
      if (field === 'username' || field === 'email') {
        if (asyncStatus[field] === 'taken') return `error.${field}.taken`
        if (asyncStatus[field] === 'error') return `error.${field}.checkFailed`
      }
      return null
    },
    [touched, submitAttempted, values, asyncStatus],
  )

  const hasSyncErrors = FIELDS.some((f) => syncErrorOf(f, values))
  const isValid =
    !hasSyncErrors && asyncStatus.username === 'ok' && asyncStatus.email === 'ok'

  const normalized = useMemo(() => toNormalized(values), [values])
  const isDirty = FIELDS.some(
    (f) => normalized[f as keyof UserEditableFields] !== initialNormalized[f as keyof UserEditableFields],
  )

  /** Only the fields that actually changed, in storage-normalized form. */
  const buildChanges = useCallback((): Partial<User> => {
    const changes: Partial<User> = {}
    for (const f of FIELDS) {
      const key = f as keyof UserEditableFields
      if (normalized[key] !== initialNormalized[key]) {
        ;(changes as Record<string, unknown>)[key] = normalized[key]
      }
    }
    return changes
  }, [normalized, initialNormalized])

  /** Mark everything touched and report whether the form may be submitted. */
  const validateForSubmit = useCallback(() => {
    setSubmitAttempted(true)
    setTouched(
      Object.fromEntries(FIELDS.map((f) => [f, true])) as Record<FieldName, boolean>,
    )
    return isValid
  }, [isValid])

  return {
    values,
    setField,
    handleBlur,
    errorOf,
    checking: {
      username: asyncStatus.username === 'checking',
      email: asyncStatus.email === 'checking',
    },
    isValid,
    isDirty,
    buildChanges,
    validateForSubmit,
  }
}
