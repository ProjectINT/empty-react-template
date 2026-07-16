import type { ReactNode } from 'react'
import { InboxIcon, RefreshCwIcon, TriangleAlertIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { t } from '../i18n'

/** Number of columns in the users table; keeps state rows spanning correctly. */
export const COLUMN_COUNT = 6

/** Skeleton rows shown on first load — same shape as real rows, no layout jump. */
export function LoadingRows({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} aria-hidden>
          <TableCell>
            <div className="flex items-center gap-3">
              <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="grid gap-1.5">
                <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
                <div className="h-3 w-40 animate-pulse rounded bg-muted/70" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-20 animate-pulse rounded bg-muted" />
          </TableCell>
          <TableCell>
            <div className="ml-auto h-7 w-40 animate-pulse rounded bg-muted" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

/** Full-width message row used for the error and empty states. */
function MessageRow({ children }: { children: ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={COLUMN_COUNT} className="h-64">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          {children}
        </div>
      </TableCell>
    </TableRow>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <MessageRow>
      <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-5" />
      </span>
      <div className="grid gap-1">
        <p className="font-medium text-foreground">{t('list.error.title')}</p>
        <p className="text-sm text-muted-foreground">{t('list.error.body')}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCwIcon />
        {t('common.retry')}
      </Button>
    </MessageRow>
  )
}

export function EmptyState() {
  return (
    <MessageRow>
      <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <InboxIcon className="size-5" />
      </span>
      <div className="grid gap-1">
        <p className="font-medium text-foreground">{t('list.empty.title')}</p>
        <p className="text-sm text-muted-foreground">{t('list.empty.body')}</p>
      </div>
    </MessageRow>
  )
}
