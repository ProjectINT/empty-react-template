import { useMemo, useState } from "react"
import { useForm } from "palistor"
import { Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { usersStore } from "@/features/users/store"
import { updateUser } from "@/features/users/api"
import { pushToast } from "@/features/users/toast"
import { t } from "@/features/users/i18n"
import { validateForm } from "@/features/users/validation"
import { toWritePatch } from "@/features/users/mappers"
import { useUniqueCheck } from "@/features/users/hooks"
import type { RolesView } from "@/features/users/hooks"
import type { UserEntity, UserFormValues } from "@/features/users/types"
import { TextField } from "@/features/users/components/fields/TextField"
import { SelectField } from "@/features/users/components/fields/SelectField"
import { ConfirmDialog } from "@/features/users/components/ConfirmDialog"

interface EditUserModalProps {
  /** Snapshot of the user being edited (the edit form is pre-populated from it). */
  user: UserEntity
  roles: RolesView
  onClose: () => void
  onSaved: () => void
}

type FieldName = keyof Omit<UserFormValues, "id">

/**
 * User edit dialog.
 *
 * Palistor's `editForm` group owns the values, live formatting (username/phone)
 * and dirty tracking. Validation is displayed on blur/submit via a local
 * `touched` set using the shared validators; async uniqueness (username/email)
 * is layered on with {@link useUniqueCheck}. The edit form is isolated from the
 * list row until a successful save reconciles it via `store.set`.
 */
export function EditUserModal({ user, roles, onClose, onSaved }: EditUserModalProps) {
  const form = useForm(usersStore)
  const edit = form.editForm

  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [guardOpen, setGuardOpen] = useState(false)

  const values: UserFormValues = {
    id: edit.id.value,
    name: edit.name.value,
    username: edit.username.value,
    email: edit.email.value,
    phone: edit.phone.value,
    role: edit.role.value,
    avatar: edit.avatar.value,
  }

  const syncErrors = validateForm(values)

  // Async uniqueness runs only once the sync format is valid.
  const usernameStatus = useUniqueCheck(
    values.username,
    "username",
    values.id,
    !syncErrors.username,
  )
  const emailStatus = useUniqueCheck(values.email, "email", values.id, !syncErrors.email)

  const asyncBlocking =
    usernameStatus === "checking" ||
    usernameStatus === "taken" ||
    emailStatus === "checking" ||
    emailStatus === "taken"

  const hasSyncError = useMemo(
    () => Object.values(syncErrors).some(Boolean),
    [syncErrors],
  )
  const canSave = !hasSyncError && !asyncBlocking && !saving

  const markTouched = (field: FieldName) =>
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }))

  const shows = (field: FieldName) => submitAttempted || Boolean(touched[field])

  /** Error to display under a field (sync first, then async conflict). */
  function fieldError(field: FieldName): string | undefined {
    if (!shows(field)) return undefined
    if (syncErrors[field]) return syncErrors[field]
    if (field === "username" && usernameStatus === "taken") {
      return t("users.valid.usernameTaken")
    }
    if (field === "email" && emailStatus === "taken") {
      return t("users.valid.emailTaken")
    }
    return undefined
  }

  async function handleSave() {
    setSubmitAttempted(true)
    if (hasSyncError || asyncBlocking) return

    setSaving(true)
    setServerError(null)
    try {
      const patch = toWritePatch(values, user.active)
      await updateUser(values.id, patch)
      // Reconcile the list row (edit form was isolated until now).
      usersStore.set(patch)
      pushToast(t("users.edit.saved"), "success")
      onSaved()
    } catch (err) {
      setServerError(
        t("users.edit.serverError", {
          message: err instanceof Error ? err.message : String(err),
        }),
      )
    } finally {
      setSaving(false)
    }
  }

  /** Route every close intent through the unsaved-changes guard. */
  function requestClose() {
    if (saving || guardOpen) return
    if (edit.dirty) {
      setGuardOpen(true)
      return
    }
    onClose()
  }

  const createdAt = new Date(user.createdAt).toLocaleDateString("ru-RU")

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) requestClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg"
        aria-describedby={undefined}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
          requestClose()
        }}
        onInteractOutside={(e) => {
          e.preventDefault()
          requestClose()
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("users.edit.title")}</DialogTitle>
          <DialogDescription>
            {t("users.edit.subtitle", { id: user.id, createdAt })}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void handleSave()
          }}
        >
          <TextField
            {...edit.name}
            autoFocus
            autoComplete="off"
            error={fieldError("name")}
            onBlur={() => markTouched("name")}
          />
          <TextField
            {...edit.username}
            autoComplete="off"
            checking={usernameStatus === "checking"}
            error={fieldError("username")}
            onBlur={() => markTouched("username")}
          />
          <TextField
            {...edit.email}
            type="email"
            autoComplete="off"
            checking={emailStatus === "checking"}
            error={fieldError("email")}
            onBlur={() => markTouched("email")}
          />
          <TextField
            {...edit.phone}
            type="tel"
            inputMode="tel"
            autoComplete="off"
            error={fieldError("phone")}
            onBlur={() => markTouched("phone")}
          />
          <SelectField
            {...edit.role}
            options={roles.options}
            loading={roles.loading}
            placeholder={t("users.field.rolePlaceholder")}
            error={fieldError("role")}
            onBlur={() => markTouched("role")}
          />
          <TextField
            {...edit.avatar}
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder={t("users.field.avatarPlaceholder")}
            error={fieldError("avatar")}
            onBlur={() => markTouched("avatar")}
          />

          {serverError ? (
            <p role="alert" className="text-sm text-destructive">
              {serverError}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={requestClose}
            >
              {t("users.edit.cancel")}
            </Button>
            <Button type="submit" disabled={!canSave}>
              {saving ? (
                <>
                  <Loader2 className="animate-spin" />
                  {t("users.edit.saving")}
                </>
              ) : (
                t("users.edit.save")
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Custom close control (routes through the unsaved-changes guard). */}
        <button
          type="button"
          aria-label={t("users.edit.close")}
          disabled={saving}
          onClick={requestClose}
          className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground opacity-70 outline-none transition-opacity hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none"
        >
          <X className="size-4" />
        </button>
      </DialogContent>

      <ConfirmDialog
        open={guardOpen}
        onOpenChange={setGuardOpen}
        title={t("users.unsaved.title")}
        description={t("users.unsaved.body")}
        confirmLabel={t("users.unsaved.discard")}
        cancelLabel={t("users.unsaved.keep")}
        destructive
        onConfirm={() => {
          setGuardOpen(false)
          onClose()
        }}
      />
    </Dialog>
  )
}
