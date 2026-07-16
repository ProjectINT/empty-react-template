/**
 * Server API for the Users screen.
 *
 * Thin `fetch` wrappers around the my-json-server mock described in README.md.
 * Writes are faked by the server (correct status, no persistence) — callers
 * treat a 2xx as "applied" and reconcile client state themselves.
 */
import type { ApiUser, Role, UniqueField, UserEntity } from "./types";
import { normalizePhone } from "./validation";

const BASE_URL =
  "https://my-json-server.typicode.com/ProjectINT/empty-react-template";

/** Server page size for the list. */
export const PAGE_SIZE = 8;

async function request(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${BASE_URL}${path}`, init);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  return res;
}

/** Map a wire user to the normalised entity kept in the store. */
function toEntity(u: ApiUser): UserEntity {
  return {
    id: String(u.id),
    name: u.name,
    username: u.username,
    email: u.email,
    phone: normalizePhone(u.phone),
    role: u.role,
    active: Boolean(u.active),
    avatar: u.avatar ?? "",
    createdAt: u.createdAt,
  };
}

export interface UsersPage {
  items: UserEntity[];
  /** Total record count from the `X-Total-Count` header (0 if unavailable). */
  total: number;
}

/** Fetch a single page with server-side pagination. */
export async function getUsersPage(
  page: number,
  limit: number = PAGE_SIZE,
): Promise<UsersPage> {
  const res = await request(`/users?_page=${page}&_limit=${limit}`);
  const total = Number(res.headers.get("X-Total-Count") ?? 0) || 0;
  const data = (await res.json()) as ApiUser[];
  return { items: data.map(toEntity), total };
}

/** Fetch the role reference list. */
export async function getRoles(): Promise<Role[]> {
  const res = await request(`/roles`);
  return (await res.json()) as Role[];
}

/**
 * Async uniqueness check via server-side filtering.
 * `currentId` excludes the user being edited from the conflict test.
 */
export async function isFieldTaken(
  field: UniqueField,
  value: string,
  currentId: string,
): Promise<boolean> {
  const res = await request(`/users?${field}=${encodeURIComponent(value)}`);
  const matches = (await res.json()) as ApiUser[];
  return matches.some((u) => String(u.id) !== currentId);
}

/** Persist edits to a user (PUT — faked by the server). */
export async function updateUser(
  id: string,
  patch: Omit<UserEntity, "createdAt">,
): Promise<void> {
  await request(`/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

/** Toggle a user's access state (PATCH — faked by the server). */
export async function setUserActive(id: string, active: boolean): Promise<void> {
  await request(`/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  });
}
