import { useEffect, useState } from "react"
import { CircleAlert, CircleCheck, Info, X } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  dismissToast,
  subscribeToasts,
  type ToastItem,
} from "@/features/users/toast"

const variantStyles: Record<ToastItem["variant"], string> = {
  error: "border-destructive/30 bg-destructive/10 text-destructive",
  success:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  info: "border-border bg-card text-card-foreground",
}

const variantIcon = {
  error: CircleAlert,
  success: CircleCheck,
  info: Info,
} as const

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => subscribeToasts(setItems), [])

  if (items.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2"
      role="region"
      aria-label="Уведомления"
    >
      {items.map((item) => {
        const Icon = variantIcon[item.variant]
        return (
          <div
            key={item.id}
            role="status"
            className={cn(
              "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm shadow-md",
              "animate-in slide-in-from-right-4 fade-in-0",
              variantStyles[item.variant]
            )}
          >
            <Icon className="mt-0.5 size-4 shrink-0" />
            <span className="flex-1">{item.message}</span>
            <button
              type="button"
              aria-label="Закрыть уведомление"
              className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
              onClick={() => dismissToast(item.id)}
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
