import * as React from "react"
import { Loader2 } from "lucide-react"
import type { FieldProxyNode } from "palistor"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * Text input adapter over a Palistor field proxy.
 *
 * Spread a field straight in — `<TextField {...form.editForm.name} />` — and the
 * proxy carries `value` + `onValueChange` + `label` + `isRequired`. Error display
 * is owned by the parent (blur/submit gating), so the message and the async
 * "checking" spinner arrive as explicit props rather than from the proxy.
 */
type TextFieldProps = FieldProxyNode<string> & {
  /** Error to show under the field (already gated by the parent). */
  error?: string
  /** Show a trailing spinner (async validation in progress). */
  checking?: boolean
  onBlur?: () => void
  type?: React.HTMLInputTypeAttribute
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  autoComplete?: string
  autoFocus?: boolean
}

export function TextField({
  value,
  onValueChange,
  label,
  placeholder,
  isRequired,
  isReadOnly,
  isDisabled,
  isVisible,
  error,
  checking,
  onBlur,
  type = "text",
  inputMode,
  autoComplete,
  autoFocus,
}: TextFieldProps) {
  const fieldId = React.useId()
  const errorId = `${fieldId}-error`

  if (isVisible === false) return null

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldId}>
        {label}
        {isRequired ? <span className="text-destructive">*</span> : null}
      </Label>
      <div className="relative">
        <Input
          id={fieldId}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          value={value ?? ""}
          placeholder={placeholder}
          readOnly={isReadOnly}
          disabled={isDisabled}
          aria-required={isRequired || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={checking ? "pr-9" : undefined}
          onChange={(e) => onValueChange?.(e.target.value)}
          onBlur={onBlur}
        />
        {checking ? (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
