/**
 * Domain types for the Users feature.
 *
 * Fields mirror the API contract described in README.md — do not redefine the
 * shape here beyond what the server actually returns.
 */

/** Role identifiers come from the `/roles` resource, not a hardcoded union. */
export type RoleId = string

/** A single user record as returned by `GET /users`. */
export interface User {
  id: number
  name: string
  username: string
  email: string
  /** Stored in normalized form (see formatters.normalizePhone). */
  phone: string
  role: RoleId
  /** Access state. `false` means the user is blocked. */
  active: boolean
  /** Optional avatar URL. */
  avatar?: string
  /** Read-only, ISO-8601 creation timestamp. */
  createdAt: string
}

/** A role from the `/roles` reference resource. */
export interface Role {
  id: RoleId
  title: string
  permissions: string[]
}

/** One page of users plus the total count taken from `X-Total-Count`. */
export interface UsersPage {
  items: User[]
  total: number
}

/** Query arguments for a paginated users request. */
export interface UsersPageArgs {
  page: number
  limit: number
}

/**
 * The subset of a user that the edit dialog is allowed to change. `id` and
 * `createdAt` are read-only and therefore excluded.
 */
export interface UserEditableFields {
  name: string
  username: string
  email: string
  /** Normalized phone (digits form), not the masked display value. */
  phone: string
  role: RoleId
  avatar: string
}
