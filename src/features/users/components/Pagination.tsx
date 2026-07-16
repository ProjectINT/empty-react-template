import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { t } from '../i18n'

interface PaginationProps {
  page: number
  limit: number
  total: number
  /** Disable controls while a page request is in flight. */
  busy?: boolean
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  limit,
  total,
  busy,
  onPageChange,
}: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / limit))
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-muted-foreground" aria-live="polite">
        {t('pagination.summary', { from, to, total })}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {t('pagination.page', { page, pages })}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon />
          {t('pagination.prev')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy || page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          {t('pagination.next')}
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}
