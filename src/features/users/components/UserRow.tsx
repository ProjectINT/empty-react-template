import { PencilIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { t } from '../i18n'
import type { User } from '../types'
import { displayPhone } from '../lib/formatters'
import { BlockToggle } from './BlockToggle'
import { UserAvatar } from './UserAvatar'
import { UserEditDialog } from './UserEditDialog'

interface UserRowProps {
  user: User
  page: number
  limit: number
  roleTitle: (id: string) => string
  onActionError: (message: string) => void
}

export function UserRow({
  user,
  page,
  limit,
  roleTitle,
  onActionError,
}: UserRowProps) {
  const blocked = !user.active
  return (
    <TableRow className={cn(blocked && 'bg-muted/30')}>
      <TableCell>
        <div
          className={cn(
            'flex min-w-0 items-center gap-3',
            blocked && 'opacity-60',
          )}
        >
          <UserAvatar name={user.name} src={user.avatar} />
          <div className="grid min-w-0">
            <span className="truncate font-medium text-foreground">
              {user.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        <span className="block truncate font-mono text-xs">
          {user.username}
        </span>
      </TableCell>
      <TableCell className="truncate text-muted-foreground">
        {displayPhone(user.phone)}
      </TableCell>
      <TableCell>
        <Badge variant="outline">{roleTitle(user.role)}</Badge>
      </TableCell>
      <TableCell>
        {user.active ? (
          <Badge variant="success">{t('status.active')}</Badge>
        ) : (
          <Badge variant="destructive">{t('status.blocked')}</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-1">
          <BlockToggle
            user={user}
            page={page}
            limit={limit}
            onError={onActionError}
          />
          <UserEditDialog
            user={user}
            page={page}
            limit={limit}
            trigger={
              <Button
                size="icon-sm"
                variant="ghost"
                title={t('action.edit')}
                aria-label={t('action.editAria', { name: user.name })}
              >
                <PencilIcon />
              </Button>
            }
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
