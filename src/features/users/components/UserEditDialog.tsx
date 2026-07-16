import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { t } from '../i18n'
import type { User } from '../types'
import { useGetRolesQuery, useUpdateUserMutation } from '../usersApi'
import { useUserForm, type FieldName } from '../useUserForm'
import { FieldShell } from './FieldShell'

const PHONE_PLACEHOLDER = '+7 (___) ___-__-__'

interface UserEditDialogProps {
  user: User
  page: number
  limit: number
  /** Element that opens the dialog; also where focus returns on close. */
  trigger: ReactNode
}

/**
 * Self-contained edit dialog: owns its open state, the unsaved-changes guard,
 * and focus management. All form logic lives in {@link useUserForm}; the body is
 * remounted on each open (Radix unmounts closed content) for a clean reset.
 */
export function UserEditDialog({
  user,
  page,
  limit,
  trigger,
}: UserEditDialogProps) {
  const [open, setOpen] = useState(false)
  const [showGuard, setShowGuard] = useState(false)
  const dirtyRef = useRef(false)
  const submittingRef = useRef(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  function requestClose() {
    if (submittingRef.current) return // never close mid-save
    if (dirtyRef.current) setShowGuard(true)
    else setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? setOpen(true) : requestClose())}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        closeLabel={t('dialog.close')}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          firstFieldRef.current?.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle>{t('dialog.title')}</DialogTitle>
          <DialogDescription>{t('dialog.description')}</DialogDescription>
        </DialogHeader>

        <UserEditForm
          user={user}
          page={page}
          limit={limit}
          firstFieldRef={firstFieldRef}
          dirtyRef={dirtyRef}
          submittingRef={submittingRef}
          onCancel={requestClose}
          onSaved={() => setOpen(false)}
        />
      </DialogContent>

      <AlertDialog open={showGuard} onOpenChange={setShowGuard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('unsaved.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('unsaved.body')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('unsaved.keep')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowGuard(false)
                setOpen(false)
              }}
            >
              {t('unsaved.discard')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}

interface UserEditFormProps {
  user: User
  page: number
  limit: number
  firstFieldRef: RefObject<HTMLInputElement | null>
  dirtyRef: RefObject<boolean>
  submittingRef: RefObject<boolean>
  onCancel: () => void
  onSaved: () => void
}

function UserEditForm({
  user,
  page,
  limit,
  firstFieldRef,
  dirtyRef,
  submittingRef,
  onCancel,
  onSaved,
}: UserEditFormProps) {
  const uid = useId()
  const fieldId = (name: string) => `${uid}-${name}`

  const form = useUserForm(user)
  const rolesQuery = useGetRolesQuery()
  const [updateUser, { isLoading: isSaving }] = useUpdateUserMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  // Mirror form state into refs the dialog reads in its close handlers.
  useEffect(() => {
    dirtyRef.current = form.isDirty
  }, [form.isDirty, dirtyRef])
  useEffect(() => {
    submittingRef.current = isSaving
  }, [isSaving, submittingRef])

  const err = (name: FieldName): string | undefined => {
    const key = form.errorOf(name)
    return key ? t(key) : undefined
  }
  const describedBy = (name: FieldName) =>
    form.errorOf(name) ? `${fieldId(name)}-error` : undefined

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setServerError(null)
    if (!form.validateForSubmit()) return
    try {
      await updateUser({
        id: user.id,
        changes: form.buildChanges(),
        page,
        limit,
      }).unwrap()
      onSaved()
    } catch {
      setServerError(t('dialog.serverError'))
    }
  }

  const canSave = form.isValid && form.isDirty && !isSaving

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-3">
      <fieldset
        disabled={isSaving}
        className="grid gap-3 disabled:opacity-70"
      >
        {/* Read-only identity */}
        <dl className="flex flex-wrap gap-x-6 gap-y-1 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <div className="flex gap-1.5">
            <dt>{t('dialog.readonly.id')}:</dt>
            <dd className="font-medium text-foreground">{user.id}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>{t('dialog.readonly.createdAt')}:</dt>
            <dd className="font-medium text-foreground">
              {formatDate(user.createdAt)}
            </dd>
          </div>
        </dl>

        {/* Name */}
        <FieldShell
          htmlFor={fieldId('name')}
          label={t('dialog.field.name')}
          required
          error={err('name')}
        >
          <Input
            id={fieldId('name')}
            ref={firstFieldRef}
            value={form.values.name}
            autoComplete="off"
            aria-invalid={!!err('name')}
            aria-describedby={describedBy('name')}
            onChange={(e) => form.setField('name', e.target.value)}
            onBlur={() => form.handleBlur('name')}
          />
        </FieldShell>

        {/* Username (async unique) */}
        <FieldShell
          htmlFor={fieldId('username')}
          label={t('dialog.field.username')}
          required
          error={err('username')}
        >
          <AdornedInput
            id={fieldId('username')}
            value={form.values.username}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!err('username')}
            aria-describedby={describedBy('username')}
            onChange={(e) => form.setField('username', e.target.value)}
            onBlur={() => form.handleBlur('username')}
            busy={form.checking.username}
          />
        </FieldShell>

        {/* Email (async unique) */}
        <FieldShell
          htmlFor={fieldId('email')}
          label={t('dialog.field.email')}
          required
          error={err('email')}
        >
          <AdornedInput
            id={fieldId('email')}
            type="email"
            inputMode="email"
            value={form.values.email}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!err('email')}
            aria-describedby={describedBy('email')}
            onChange={(e) => form.setField('email', e.target.value)}
            onBlur={() => form.handleBlur('email')}
            busy={form.checking.email}
          />
        </FieldShell>

        {/* Phone (masked) */}
        <FieldShell
          htmlFor={fieldId('phone')}
          label={t('dialog.field.phone')}
          required
          error={err('phone')}
        >
          <Input
            id={fieldId('phone')}
            type="tel"
            inputMode="tel"
            placeholder={PHONE_PLACEHOLDER}
            value={form.values.phone}
            autoComplete="off"
            aria-invalid={!!err('phone')}
            aria-describedby={describedBy('phone')}
            onChange={(e) => form.setField('phone', e.target.value)}
            onBlur={() => form.handleBlur('phone')}
          />
        </FieldShell>

        {/* Role (from /roles) */}
        <FieldShell
          htmlFor={fieldId('role')}
          label={t('dialog.field.role')}
          required
          error={err('role')}
        >
          <Select
            value={form.values.role}
            onValueChange={(v) => {
              form.setField('role', v)
              form.handleBlur('role')
            }}
            disabled={isSaving || rolesQuery.isLoading}
          >
            <SelectTrigger
              id={fieldId('role')}
              aria-invalid={!!err('role')}
              aria-describedby={describedBy('role')}
            >
              <SelectValue placeholder={t('dialog.role.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {(rolesQuery.data ?? []).map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>

        {/* Avatar (optional URL) */}
        <FieldShell
          htmlFor={fieldId('avatar')}
          label={t('dialog.field.avatar')}
          optionalLabel={t('dialog.field.avatarOptional')}
          error={err('avatar')}
        >
          <Input
            id={fieldId('avatar')}
            type="url"
            inputMode="url"
            placeholder="https://…"
            value={form.values.avatar}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!err('avatar')}
            aria-describedby={describedBy('avatar')}
            onChange={(e) => form.setField('avatar', e.target.value)}
            onBlur={() => form.handleBlur('avatar')}
          />
        </FieldShell>
      </fieldset>

      {serverError && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {serverError}
        </p>
      )}

      <DialogFooter className="mt-1">
        <Button
          type="button"
          variant="outline"
          disabled={isSaving}
          onClick={onCancel}
        >
          {t('dialog.cancel')}
        </Button>
        <Button type="submit" disabled={!canSave}>
          {isSaving && <Loader2Icon className="animate-spin" />}
          {isSaving ? t('dialog.saving') : t('dialog.save')}
        </Button>
      </DialogFooter>
    </form>
  )
}

/** Input with an optional trailing spinner (used for async uniqueness checks). */
function AdornedInput({
  busy,
  className,
  ...props
}: ComponentProps<typeof Input> & { busy?: boolean }) {
  return (
    <div className="relative">
      <Input className={cn(busy && 'pr-9', className)} {...props} />
      {busy && (
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          role="status"
          aria-label={t('dialog.checking')}
        >
          <Loader2Icon className="size-4 animate-spin" />
        </span>
      )}
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
  }).format(d)
}
