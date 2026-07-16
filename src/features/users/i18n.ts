/**
 * Centralised user-facing strings.
 *
 * Every string rendered by the Users feature goes through {@link t} so nothing
 * is hard-coded in markup — swapping `messages` for another locale (or wiring a
 * real i18n backend) localises the whole screen without touching components.
 */

const messages = {
  "users.title": "Пользователи",
  "users.subtitle": "Список пользователей и редактирование профиля",

  // Table headers
  "users.col.user": "Пользователь",
  "users.col.contacts": "Контакты",
  "users.col.role": "Роль",
  "users.col.status": "Доступ",
  "users.col.actions": "Действия",

  // Access state
  "users.status.active": "Активен",
  "users.status.blocked": "Заблокирован",

  // Row actions
  "users.action.block": "Заблокировать",
  "users.action.unblock": "Разблокировать",
  "users.action.edit": "Редактировать",
  "users.action.editAria": "Редактировать пользователя {name}",
  "users.action.blockAria": "Заблокировать пользователя {name}",
  "users.action.unblockAria": "Разблокировать пользователя {name}",

  // List states
  "users.list.loading": "Загрузка пользователей…",
  "users.list.error": "Не удалось загрузить список пользователей",
  "users.list.retry": "Повторить",
  "users.list.empty": "Пользователи не найдены",

  // Pagination
  "users.pager.prev": "Назад",
  "users.pager.next": "Вперёд",
  "users.pager.page": "Страница {page} из {total}",
  "users.pager.range": "{from}–{to} из {total}",
  "users.pager.pageAria": "Перейти на страницу {page}",

  // Optimistic action feedback
  "users.toast.blockFailed": "Не удалось изменить доступ. Изменения отменены.",
  "users.confirm.blockTitle": "Заблокировать пользователя?",
  "users.confirm.blockBody":
    "Пользователь {name} потеряет доступ. Действие можно отменить позже.",
  "users.confirm.confirm": "Заблокировать",
  "users.confirm.cancel": "Отмена",

  // Edit dialog
  "users.edit.title": "Редактирование пользователя",
  "users.edit.subtitle": "ID {id} · создан {createdAt}",
  "users.edit.save": "Сохранить",
  "users.edit.saving": "Сохранение…",
  "users.edit.cancel": "Отмена",
  "users.edit.close": "Закрыть",
  "users.edit.serverError": "Не удалось сохранить изменения: {message}",
  "users.edit.saved": "Изменения сохранены",
  "users.edit.checking": "Проверка…",

  // Unsaved-changes guard
  "users.unsaved.title": "Несохранённые изменения",
  "users.unsaved.body": "Изменения не сохранены. Закрыть окно и потерять их?",
  "users.unsaved.discard": "Закрыть без сохранения",
  "users.unsaved.keep": "Продолжить редактирование",

  // Field labels
  "users.field.name": "Имя",
  "users.field.username": "Логин",
  "users.field.email": "Email",
  "users.field.phone": "Телефон",
  "users.field.role": "Роль",
  "users.field.avatar": "Аватар (URL)",
  "users.field.rolePlaceholder": "Выберите роль",
  "users.field.avatarPlaceholder": "https://…",

  // Validation
  "users.valid.required": "Обязательное поле",
  "users.valid.nameChars": "Только буквы, пробел и дефис",
  "users.valid.nameLength": "Длина от 2 до 50 символов",
  "users.valid.usernameChars": "Только строчные латинские буквы, цифры и «_»",
  "users.valid.usernameLength": "Не короче 3 символов",
  "users.valid.usernameTaken": "Логин уже используется",
  "users.valid.emailFormat": "Некорректный email",
  "users.valid.emailTaken": "Email уже используется",
  "users.valid.phoneIncomplete": "Введите телефон полностью",
  "users.valid.avatarUrl": "Введите корректный URL",
  "users.valid.checkFailed": "Не удалось проверить уникальность",
} as const;

export type MessageKey = keyof typeof messages;

/**
 * Resolve a message key, interpolating `{placeholder}` tokens.
 * Unknown keys fall back to the key itself (visible during development).
 */
export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const template: string = messages[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_m, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  );
}
