import { useState } from "react"
import { useForm, useNotifier } from "palistor"
import { RefreshCw, TriangleAlert, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usersStore } from "@/features/users/store"
import { PAGE_SIZE } from "@/features/users/api"
import { pushToast } from "@/features/users/toast"
import { t } from "@/features/users/i18n"
import { useRoles } from "@/features/users/hooks"
import { toFormValues } from "@/features/users/mappers"
import type { UserEntity } from "@/features/users/types"
import { UserRow } from "@/features/users/components/UserRow"
import { Pagination } from "@/features/users/components/Pagination"
import { EditUserModal } from "@/features/users/components/EditUserModal"
import { Toaster } from "@/features/users/components/Toaster"

const COLUMN_COUNT = 5

/** Stable notifier so list resolvers surface errors as toasts. */
const notify = (message: string) => pushToast(message, "error")

export function UsersScreen() {
  const form = useForm(usersStore)
  const roles = useRoles()
  const [editUser, setEditUser] = useState<UserEntity | null>(null)

  useNotifier(usersStore, notify)

  const list = form.users
  const loading = list.loading
  const error = form.usersError.value
  const page = form.page.value
  const total = form.totalCount.value

  // Building the rows unconditionally subscribes this component to list
  // membership — the result is consumed in JSX so it can never be optimised
  // away. Skeletons hide the rows while loading.
  const rows = list.map((user, _index, id) => (
    <UserRow key={id} user={user} roleTitles={roles.titles} onEdit={openEdit} />
  ))

  // Reading `list.map` above lazily triggers the resolver (deferred a tick),
  // after which `loading` drives the skeletons. palistor's loading flag is the
  // single source of truth for the list view state.
  const showLoading = loading
  const isEmpty = !loading && !error && rows.length === 0

  function openEdit(snapshot: UserEntity) {
    form.editForm.reset(toFormValues(snapshot)) // pre-populate before the dialog mounts
    setEditUser(snapshot)
  }

  function goToPage(next: number) {
    if (next === page || loading) return
    usersStore.setValues({ page: next })
  }

  function retry() {
    usersStore.setValues({
      usersError: "",
      reloadToken: form.reloadToken.value + 1,
    })
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 text-left">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Users className="size-5" />
        </span>
        <div>
          <h2 className="!m-0 text-xl font-semibold">{t("users.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("users.subtitle")}</p>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t("users.col.user")}</TableHead>
              <TableHead>{t("users.col.contacts")}</TableHead>
              <TableHead>{t("users.col.role")}</TableHead>
              <TableHead>{t("users.col.status")}</TableHead>
              <TableHead className="text-right">{t("users.col.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showLoading ? (
              <SkeletonRows />
            ) : error ? (
              <ErrorRow onRetry={retry} />
            ) : isEmpty ? (
              <EmptyRow />
            ) : (
              rows
            )}
          </TableBody>
        </Table>

        <Pagination
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          loading={showLoading}
          onPage={goToPage}
        />
      </div>

      {editUser ? (
        <EditUserModal
          key={editUser.id}
          user={editUser}
          roles={roles}
          onClose={() => setEditUser(null)}
          onSaved={() => setEditUser(null)}
        />
      ) : null}

      <Toaster />
    </div>
  )
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <div className="flex justify-end gap-1.5">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-7 w-24" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

function ErrorRow({ onRetry }: { onRetry: () => void }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={COLUMN_COUNT}>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <TriangleAlert className="size-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{t("users.list.error")}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw />
            {t("users.list.retry")}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

function EmptyRow() {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={COLUMN_COUNT}>
        <p className="py-10 text-center text-sm text-muted-foreground">
          {t("users.list.empty")}
        </p>
      </TableCell>
    </TableRow>
  )
}
