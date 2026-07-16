import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { t } from "@/features/users/i18n"

interface PaginationProps {
  page: number
  total: number
  pageSize: number
  loading: boolean
  onPage: (page: number) => void
}

export function Pagination({ page, total, pageSize, loading, onPage }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const canPrev = page > 1 && !loading
  const canNext = page < pageCount && !loading

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-3 text-sm">
      <p className="text-muted-foreground" aria-live="polite">
        {t("users.pager.range", { from, to, total })}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={() => onPage(page - 1)}
          aria-label={t("users.pager.pageAria", { page: page - 1 })}
        >
          <ChevronLeft />
          {t("users.pager.prev")}
        </Button>

        <span className="min-w-[7rem] text-center text-muted-foreground">
          {t("users.pager.page", { page, total: pageCount })}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={() => onPage(page + 1)}
          aria-label={t("users.pager.pageAria", { page: page + 1 })}
        >
          {t("users.pager.next")}
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
