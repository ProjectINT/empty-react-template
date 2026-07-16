/**
 * Palistor store for the Users screen.
 *
 * Owns everything stateful:
 *   - `users`      — server-paginated entity list (resolver reads `page`);
 *   - `roles`      — reference list loaded from `/roles`;
 *   - `page` / `totalCount` / `usersError` / `reloadToken` — list view state;
 *   - `editForm`   — an isolated group backing the edit dialog (values +
 *                    formatters + setters + validation + dirty tracking).
 *
 * The edit form is deliberately NOT bound to the list entity: editing must not
 * leak into the visible row until the user saves. On success the dialog calls
 * `store.set(entity)` to reconcile the row.
 */
import { Palistor, defineList } from "palistor";
import type { Role, UserEntity } from "./types";
import { PAGE_SIZE, getRoles, getUsersPage } from "./api";
import { t } from "./i18n";
import {
  formatPhone,
  formatUsername,
  validateAvatar,
  validateEmail,
  validateName,
  validatePhone,
  validateRole,
  validateUsername,
} from "./validation";

const config = {
  /** 1-based current page (drives the users resolver via deps). */
  page: { value: 1 },
  /** Total record count from the last successful page load. */
  totalCount: { value: 0 },
  /** Last list-load error message (empty when healthy) — drives the error state. */
  usersError: { value: "" },
  /** Bumped to force a list re-resolve (retry after an error). */
  reloadToken: { value: 0 },

  /** Role reference list — lazily loaded on first access. */
  roles: defineList<Role>({
    template: {
      id: { value: "" },
      title: { value: "" },
    },
    resolve: {
      resolver: async () => getRoles(),
      onError: (_err, { notify }) => notify(t("users.list.error")),
    },
  }),

  /** Server-paginated user list. */
  users: defineList<UserEntity>({
    template: {
      id: { value: "" },
      name: { value: "" },
      username: { value: "" },
      email: { value: "" },
      phone: { value: "" },
      role: { value: "" },
      active: { value: false },
      avatar: { value: "" },
      createdAt: { value: "" },
    },
    resolve: {
      resolver: async (values, store) => {
        // `store` is typed generically inside a list resolver; narrow to the
        // meta fields we write (values are updated at runtime on the real store).
        const meta = store as unknown as {
          setValues(patch: Record<string, unknown>): void;
        };
        // Clear any prior error before this attempt.
        meta.setValues({ usersError: "" });
        try {
          const page = Number((values as { page?: number }).page) || 1;
          const { items, total } = await getUsersPage(page, PAGE_SIZE);
          meta.setValues({ totalCount: total });
          return items;
        } catch (err) {
          meta.setValues({
            usersError: err instanceof Error ? err.message : String(err),
          });
          throw err; // let Palistor reset `loading` and route to onError
        }
      },
      onError: (_err, { notify }) => notify(t("users.list.error")),
      deps: ["page", "reloadToken"]
    },
  }),

  /**
   * Isolated edit-form group. Validators reference the shared units so the
   * model and the dialog agree. `id` is read-only and only carried for the
   * write; `phone`/`username` reformat as the user types.
   */
  editForm: {
    id: { value: "", isReadOnly: true },
    name: {
      value: "",
      isRequired: true,
      label: t("users.field.name"),
      validate: (v: unknown) => validateName(v),
    },
    username: {
      value: "",
      isRequired: true,
      label: t("users.field.username"),
      formatter: formatUsername,
      validate: (v: unknown) => validateUsername(v),
    },
    email: {
      value: "",
      isRequired: true,
      label: t("users.field.email"),
      validate: (v: unknown) => validateEmail(v),
    },
    phone: {
      value: "",
      isRequired: true,
      label: t("users.field.phone"),
      formatter: formatPhone,
      validate: (v: unknown) => validatePhone(v),
    },
    role: {
      value: "",
      isRequired: true,
      label: t("users.field.role"),
      validate: (v: unknown) => validateRole(v),
    },
    avatar: {
      value: "",
      label: t("users.field.avatar"),
      validate: (v: unknown) => validateAvatar(v),
    },
  },
};

export const usersStore = new Palistor({ config });

export type UsersConfig = typeof config;
