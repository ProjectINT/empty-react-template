import { useEffect, useMemo, useState } from 'react'
import { RefreshCwIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { t } from '../i18n'
import type { UsersPage } from '../types'
import { useGetRolesQuery, useGetUsersPageQuery } from '../usersApi'
import { EmptyState, ErrorState, LoadingRows } from './ListStates'
import { Pagination } from './Pagination'
import { UserRow } from './UserRow'

const PAGE_SIZE = 10
const NOTICE_TIMEOUT_MS = 6000

export function UsersScreen() {
  const [page, setPage] = useState(1)
  const [notice, setNotice] = useState<string | null>(null)

  const { data, isLoading, isFetching, isError, refetch } =
    useGetUsersPageQuery({ page, limit: PAGE_SIZE })
  const rolesQuery = useGetRolesQuery()

  // Keep the last successful page on screen while the next one loads so paging
  // never collapses the table into a spinner (no layout jump).
  const [lastPage, setLastPage] = useState<UsersPage | null>(null)
  useEffect(() => {
    if (data) setLastPage(data)
  }, [data])
  const view = data ?? lastPage

  const roleTitle = useMemo(() => {
    const map = new Map((rolesQuery.data ?? []).map((r) => [r.id, r.title]))
    return (id: string) => map.get(id) ?? id
  }, [rolesQuery.data])

  // Auto-dismiss transient action notices; also clear them when paging.
  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(null), NOTICE_TIMEOUT_MS)
    return () => clearTimeout(id)
  }, [notice])
  useEffect(() => setNotice(null), [page])

  const total = view?.total ?? 0
  const showInitialLoading = isLoading && !view
  const showError = isError && !view
  const showEmpty = !!view && view.items.length === 0
  const showStaleError = isError && !!view

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 text-left sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t('screen.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('screen.subtitle')}
        </p>
      </header>

      {/* Live region for optimistic-action rollbacks and stale-data errors. */}
      <div aria-live="assertive" className="empty:hidden">
        {notice && (
          <div
            role="alert"
            className="mb-4 flex items-start justify-between gap-3 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <span>{notice}</span>
            <button
              type="button"
              aria-label={t('dialog.close')}
              className="shrink-0 opacity-70 transition-opacity hover:opacity-100"
              onClick={() => setNotice(null)}
            >
              <XIcon className="size-4" />
            </button>
          </div>
        )}
      </div>

      {showStaleError && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <span>{t('list.error.title')}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCwIcon />
            {t('common.retry')}
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[30%]">{t('table.user')}</TableHead>
              <TableHead className="w-[17%]">{t('table.username')}</TableHead>
              <TableHead className="w-[16%]">{t('table.phone')}</TableHead>
              <TableHead className="w-[13%]">{t('table.role')}</TableHead>
              <TableHead className="w-[14%]">{t('table.status')}</TableHead>
              <TableHead className="w-[10%] text-right">
                {t('table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            aria-busy={isFetching}
            className={
              isFetching && view ? 'opacity-60 transition-opacity' : undefined
            }
          >
            {showInitialLoading && <LoadingRows />}
            {showError && <ErrorState onRetry={() => refetch()} />}
            {showEmpty && <EmptyState />}
            {view &&
              view.items.length > 0 &&
              view.items.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  page={page}
                  limit={PAGE_SIZE}
                  roleTitle={roleTitle}
                  onActionError={setNotice}
                />
              ))}
          </TableBody>
        </Table>
      </div>

      {view && view.items.length > 0 && (
        <div className="mt-4">
          <Pagination
            page={page}
            limit={PAGE_SIZE}
            total={total}
            busy={isFetching}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
