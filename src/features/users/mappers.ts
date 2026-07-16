/**
 * Pure mappers between the entity shape and the edit-form shape.
 */
import { formatPhone, normalizePhone } from "./validation";
import type { UserEntity, UserFormValues } from "./types";

/** Entity → edit-form values (phone masked for display). */
export function toFormValues(u: UserEntity): UserFormValues {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    phone: formatPhone(u.phone),
    role: u.role,
    avatar: u.avatar ?? "",
  };
}

/** Edit-form values → write payload (phone normalised; `active` carried through). */
export function toWritePatch(
  v: UserFormValues,
  active: boolean,
): Omit<UserEntity, "createdAt"> {
  return {
    id: v.id,
    name: v.name.trim(),
    username: v.username,
    email: v.email.trim(),
    phone: normalizePhone(v.phone),
    role: v.role,
    avatar: v.avatar.trim(),
    active,
  };
}
