/**
 * React hooks that layer async, UI-facing behaviour on top of the Palistor model.
 */
import { useEffect, useState } from "react";
import { useForm } from "palistor";
import { isFieldTaken } from "./api";
import { usersStore } from "./store";
import type { UniqueField } from "./types";
import type { SelectOption } from "./components/fields/SelectField";

export type UniqueStatus = "idle" | "checking" | "ok" | "taken" | "error";

/**
 * Debounced server-side uniqueness check for a field.
 *
 * Runs only while `enabled` (the caller passes the field's sync validity, so we
 * never probe malformed values). Each value change restarts the debounce and
 * cancels any in-flight result, so the returned status always reflects the
 * latest value.
 *
 * @param value      current field value
 * @param field      which server field to filter by
 * @param currentId  the edited user's id (excluded from the conflict test)
 * @param enabled    gate — typically "the sync format is valid"
 * @param delay      debounce in ms
 */
export function useUniqueCheck(
  value: string,
  field: UniqueField,
  currentId: string,
  enabled: boolean,
  delay = 450,
): UniqueStatus {
  const [status, setStatus] = useState<UniqueStatus>("idle");

  useEffect(() => {
    if (!enabled || !value) {
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const taken = await isFieldTaken(field, value, currentId);
        if (!cancelled) setStatus(taken ? "taken" : "ok");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, field, currentId, enabled, delay]);

  return status;
}

export interface RolesView {
  options: SelectOption[];
  /** id → title, for rendering a role name in the list. */
  titles: Record<string, string>;
  loading: boolean;
}

/**
 * Subscribe to the role reference list (loaded from `/roles`).
 * Accessing the list triggers its lazy resolve on first use.
 */
/** Runtime shape of a role entity proxy (map yields opaque refs). */
type RoleItemProxy = { title: { value: string } };

export function useRoles(): RolesView {
  const form = useForm(usersStore);
  const roles = form.roles;

  // `map` both triggers the lazy resolve and subscribes to the list; the result
  // is consumed so it is never optimised away.
  const options: SelectOption[] = [];
  const titles: Record<string, string> = {};
  roles.map((item, _index, id) => {
    const label = (item as unknown as RoleItemProxy).title.value || id;
    options.push({ value: id, label });
    titles[id] = label;
    return null;
  });

  return { options, titles, loading: roles.loading };
}
