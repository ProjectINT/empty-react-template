import { Loader2Icon, LockIcon, LockOpenIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { t } from '../i18n'
import type { User } from '../types'
import { useToggleUserActiveMutation } from '../usersApi'

interface BlockToggleProps {
  user: User
  page: number
  limit: number
  /** Surfaces a rollback message when the optimistic toggle fails. */
  onError: (message: string) => void
}

/**
 * Inline block / unblock control. The toggle is optimistic (the cache is
 * updated immediately and rolled back on failure by the API layer). Blocking
 * asks for confirmation; the button self-disables while its request is in
 * flight so the same action cannot be fired twice.
 */
export function BlockToggle({ user, page, limit, onError }: BlockToggleProps) {
  const [toggle, { isLoading }] = useToggleUserActiveMutation()

  async function run(active: boolean) {
    try {
      await toggle({ id: user.id, active, page, limit }).unwrap()
    } catch {
      onError(t('toggle.error'))
    }
  }

  if (!user.active) {
    return (
      <Button
        size="icon-sm"
        variant="ghost"
        disabled={isLoading}
        title={t('action.unblock')}
        aria-label={t('action.unblockAria', { name: user.name })}
        onClick={() => run(true)}
      >
        {isLoading ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <LockOpenIcon />
        )}
      </Button>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          disabled={isLoading}
          title={t('action.block')}
          aria-label={t('action.blockAria', { name: user.name })}
        >
          {isLoading ? <Loader2Icon className="animate-spin" /> : <LockIcon />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('confirm.block.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('confirm.block.body', { name: user.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('confirm.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={() => run(false)}>
            {t('confirm.block.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
