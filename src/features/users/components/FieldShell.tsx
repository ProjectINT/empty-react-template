import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FieldShellProps {
  /** id of the control this field wraps (for label + error association). */
  htmlFor: string
  label: string
  required?: boolean
  /** Optional short "(optional)"-style marker rendered next to the label. */
  optionalLabel?: string
  /** Resolved, localized error text (or empty when valid). */
  error?: string
  /** Optional helper text shown when there is no error. */
  hint?: string
  children: ReactNode
}

/**
 * Label + control + error/hint layout with the accessibility wiring done once.
 * The error line always reserves height so validation never shifts the layout.
 */
export function FieldShell({
  htmlFor,
  label,
  required,
  optionalLabel,
  error,
  hint,
  children,
}: FieldShellProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>
        <span>{label}</span>
        {required && (
          <span aria-hidden className="text-destructive">
            *
          </span>
        )}
        {optionalLabel && (
          <span className="text-xs font-normal text-muted-foreground">
            ({optionalLabel})
          </span>
        )}
      </Label>
      {children}
      <p
        id={`${htmlFor}-error`}
        role={error ? 'alert' : undefined}
        className={cn(
          'min-h-4 text-xs leading-4',
          error ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {error || hint || ''}
      </p>
    </div>
  )
}
