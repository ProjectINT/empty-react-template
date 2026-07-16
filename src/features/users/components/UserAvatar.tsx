import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface UserAvatarProps {
  name: string
  src?: string
  className?: string
}

/** Compact avatar with a graceful initials fallback when the image is missing. */
export function UserAvatar({ name, src, className }: UserAvatarProps) {
  const [failed, setFailed] = useState(false)
  // Reset the error flag when the source changes (e.g. after an edit).
  useEffect(() => setFailed(false), [src])

  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground',
        className,
      )}
      aria-hidden
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          className="size-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  )
}
