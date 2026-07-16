import * as React from "react"
import type { FieldProxyNode } from "palistor"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface SelectOption {
  value: string
  label: string
}

/**
 * Select adapter over a Palistor field proxy. Closing the popover counts as a
 * blur so the parent can reveal a "required" error the same way text inputs do.
 */
type SelectFieldProps = FieldProxyNode<string> & {
  options: SelectOption[]
  error?: string
  loading?: boolean
  onBlur?: () => void
}

export function SelectField({
  value,
  onValueChange,
  label,
  placeholder,
  isRequired,
  isDisabled,
  isVisible,
  options,
  error,
  loading,
  onBlur,
}: SelectFieldProps) {
  const fieldId = React.useId()
  const errorId = `${fieldId}-error`

  if (isVisible === false) return null

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId}>
        {label}
        {isRequired ? <span className="text-destructive">*</span> : null}
      </Label>
      <Select
        value={value || undefined}
        disabled={isDisabled || loading}
        onValueChange={(v) => onValueChange?.(v)}
        onOpenChange={(open) => {
          if (!open) onBlur?.()
        }}
      >
        <SelectTrigger
          id={fieldId}
          aria-required={isRequired || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
