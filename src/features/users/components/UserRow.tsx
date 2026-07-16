import { useState } from "react"
import { useForm } from "palistor"
import type { PalistorRef } from "palistor"
import { Ban, Loader2, Pencil, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { usersStore } from "@/features/users/store"
import { setUserActive } from "@/features/users/api"
import { pushToast } from "@/features/users/toast"
import { t } from "@/features/users/i18n"
import { formatPhone } from "@/features/users/validation"
import type { UserEntity } from "@/features/users/types"
import { ConfirmDialog } from "@/features/users/components/ConfirmDialog"

interface UserRowProps {
  user: PalistorRef<UserEntity>
  roleTitles: Record<string, string>
  onEdit: (snapshot: UserEntity) => void
}

export function UserRow({ user, roleTitles, onEdit }: UserRowProps) {
  const u = useForm(user)

  const id = u.id // entity id is exposed as a plain string
  const name = u.name.value
  const active = u.active.value

  const [pending, setPending] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  /** Optimistic access toggle with rollback on failure. */
  async function applyActive(next: boolean) {
    if (pending) return
    setPending(true)
    usersStore.set({ id, active: next }) // optimistic
    try {
      await setUserActive(id, next)
    } catch {
      usersStore.set({ id, active: !next }) // rollback
      pushToast(t("users.toast.blockFailed"), "error")
    } finally {
      setPending(false)
    }
  }

  function onToggle() {
    if (pending) return
    if (active) {
      setConfirmOpen(true) // blocking requires confirmation
    } else {
      void applyActive(true) // unblocking is immediate
    }
  }

  function snapshot(): UserEntity {
    return {
      id,
      name,
      username: u.username.value,
      email: u.email.value,
      phone: u.phone.value,
      role: u.role.value,
      active,
      avatar: u.avatar.value,
      createdAt: u.createdAt.value,
    }
  }

  return (
    <TableRow data-state={active ? undefined : "blocked"}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar src={u.avatar.value} name={name} />
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{name}</span>
            <span className="text-xs text-muted-foreground">@{u.username.value}</span>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col text-sm">
          <span>{u.email.value}</span>
          <span className="text-xs text-muted-foreground">
            {formatPhone(u.phone.value)}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="muted">{roleTitles[u.role.value] ?? u.role.value}</Badge>
      </TableCell>

      <TableCell>
        {active ? (
          <Badge variant="success">{t("users.status.active")}</Badge>
        ) : (
          <Badge variant="destructive">{t("users.status.blocked")}</Badge>
        )}
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            aria-label={t(
              active ? "users.action.blockAria" : "users.action.unblockAria",
              { name },
            )}
            onClick={onToggle}
          >
            {pending ? (
              <Loader2 className="animate-spin" />
            ) : active ? (
              <Ban />
            ) : (
              <ShieldCheck />
            )}
            {active ? t("users.action.block") : t("users.action.unblock")}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            aria-label={t("users.action.editAria", { name })}
            onClick={() => onEdit(snapshot())}
          >
            <Pencil />
            {t("users.action.edit")}
          </Button>
        </div>
      </TableCell>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t("users.confirm.blockTitle")}
        description={t("users.confirm.blockBody", { name })}
        confirmLabel={t("users.confirm.confirm")}
        cancelLabel={t("users.confirm.cancel")}
        destructive
        onConfirm={() => {
          setConfirmOpen(false)
          void applyActive(false)
        }}
      />
    </TableRow>
  )
}

function Avatar({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false)
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  if (!src || failed) {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
        {initials || "?"}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      width={36}
      height={36}
      loading="lazy"
      className="size-9 shrink-0 rounded-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}
