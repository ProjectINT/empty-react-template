/**
 * Data model for the Users screen.
 *
 * The shapes mirror the server contract described in README.md — do not extend
 * or rename fields here without updating the API layer accordingly.
 */

/** A role from the `/roles` reference resource. */
export interface Role {
  /** Role identifier, e.g. `"admin"` — also the value stored on a user. */
  id: string;
  title: string;
  permissions?: string[];
}

/** A user as returned by the server (`id` is numeric on the wire). */
export interface ApiUser {
  id: number | string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  avatar: string;
  createdAt: string;
}

/**
 * A user as held in the Palistor entity registry.
 *
 * `id` is normalised to a string (Palistor keys entities by string id) and
 * `phone` is normalised to canonical `+<digits>` form; the UI formats it for
 * display. Everything else matches {@link ApiUser}.
 */
export type UserEntity = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  avatar: string;
  createdAt: string;
};

/** The subset of fields the edit form owns (read-only `id` kept for the write). */
export type UserFormValues = {
  id: string;
  name: string;
  username: string;
  email: string;
  /** Masked, display form (e.g. `+1 (202) 555-0101`). Normalised on submit. */
  phone: string;
  role: string;
  avatar: string;
};

/** Fields that uniqueness is checked against on the server. */
export type UniqueField = "username" | "email";
