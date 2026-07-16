/**
 * Central string catalog. Every user-facing string in the feature is resolved
 * through `t(key)`, so no copy is hardcoded in markup and the whole screen can
 * be localized by swapping this dictionary.
 */
const messages = {
  // Screen
  'screen.title': 'Пользователи',
  'screen.subtitle': 'Управление доступом и данными пользователей',

  // Table headers
  'table.user': 'Пользователь',
  'table.username': 'Логин',
  'table.email': 'Email',
  'table.phone': 'Телефон',
  'table.role': 'Роль',
  'table.status': 'Доступ',
  'table.actions': 'Действия',

  // Status
  'status.active': 'Активен',
  'status.blocked': 'Заблокирован',

  // Row actions
  'action.edit': 'Редактировать',
  'action.block': 'Заблокировать',
  'action.unblock': 'Разблокировать',
  'action.editAria': 'Редактировать пользователя {name}',
  'action.blockAria': 'Заблокировать пользователя {name}',
  'action.unblockAria': 'Разблокировать пользователя {name}',

  // List states
  'list.loading': 'Загрузка пользователей…',
  'list.error.title': 'Не удалось загрузить список',
  'list.error.body': 'Проверьте соединение и попробуйте снова.',
  'list.empty.title': 'Пользователей нет',
  'list.empty.body': 'На этой странице пока никого.',
  'common.retry': 'Повторить',

  // Toggle-active errors / confirm
  'toggle.error': 'Не удалось изменить доступ пользователя. Изменение отменено.',
  'confirm.block.title': 'Заблокировать пользователя?',
  'confirm.block.body':
    'Пользователь {name} потеряет доступ. Это действие можно отменить позже.',
  'confirm.block.confirm': 'Заблокировать',
  'confirm.cancel': 'Отмена',

  // Pagination
  'pagination.summary': 'Показаны {from}–{to} из {total}',
  'pagination.prev': 'Назад',
  'pagination.next': 'Вперёд',
  'pagination.page': 'Страница {page} из {pages}',

  // Edit dialog
  'dialog.title': 'Редактирование пользователя',
  'dialog.description': 'Измените данные пользователя и сохраните.',
  'dialog.field.name': 'Имя',
  'dialog.field.username': 'Логин',
  'dialog.field.email': 'Email',
  'dialog.field.phone': 'Телефон',
  'dialog.field.role': 'Роль',
  'dialog.field.avatar': 'Аватар (URL)',
  'dialog.field.avatarOptional': 'необязательно',
  'dialog.readonly.id': 'ID',
  'dialog.readonly.createdAt': 'Создан',
  'dialog.role.placeholder': 'Выберите роль',
  'dialog.checking': 'Проверка…',
  'dialog.save': 'Сохранить',
  'dialog.saving': 'Сохранение…',
  'dialog.cancel': 'Отмена',
  'dialog.close': 'Закрыть',
  'dialog.serverError': 'Не удалось сохранить изменения. Попробуйте ещё раз.',

  // Unsaved-changes guard
  'unsaved.title': 'Несохранённые изменения',
  'unsaved.body': 'Изменения не сохранены. Закрыть окно и потерять их?',
  'unsaved.discard': 'Закрыть без сохранения',
  'unsaved.keep': 'Продолжить редактирование',

  // Validation
  'error.name.required': 'Укажите имя',
  'error.name.length': 'Имя должно быть от 2 до 50 символов',
  'error.name.chars': 'Только буквы, пробел и дефис',
  'error.username.required': 'Укажите логин',
  'error.username.chars': 'Только строчные латинские буквы, цифры, точка и _',
  'error.username.taken': 'Такой логин уже используется',
  'error.username.checkFailed': 'Не удалось проверить логин',
  'error.email.required': 'Укажите email',
  'error.email.format': 'Некорректный формат email',
  'error.email.taken': 'Email уже используется',
  'error.email.checkFailed': 'Не удалось проверить email',
  'error.phone.required': 'Укажите телефон',
  'error.phone.incomplete': 'Введите номер полностью',
  'error.role.required': 'Выберите роль',
  'error.avatar.url': 'Введите корректный URL',
} as const

export type MessageKey = keyof typeof messages

/**
 * Resolve a message key, interpolating `{name}`-style placeholders. Unknown
 * keys fall back to the key itself so a missing translation is visible, not
 * silently blank.
 */
export function t(
  key: MessageKey | (string & {}),
  params?: Record<string, string | number>,
): string {
  const template = (messages as Record<string, string>)[key] ?? key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  )
}
