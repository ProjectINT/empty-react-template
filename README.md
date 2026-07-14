# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Фейковый API (my-json-server)

Данные — [`db.json`](./db.json), раздаются из ветки `main`. Base URL: `https://my-json-server.typicode.com/ProjectINT/empty-react-template`.
Ресурсы: `users` (`id`, `name`, `username`, `email`, `role`, `active`, `avatar`, `createdAt`), `roles` (`admin`, `manager`, `editor`, `user`), `profile`.
Запись фейковая: методы отвечают корректно, но данные не сохраняются. Кэш ~1 мин, лимит `db.json` — 10 000 байт (иначе `507`).

| Метод | Путь | Ответ |
| --- | --- | --- |
| `GET` | `/users` | `200` — все пользователи |
| `GET` | `/users/1` | `200` — один пользователь, `404` если нет |
| `GET` | `/users?role=admin&active=true` | `200` — фильтр по любым полям |
| `GET` | `/users?_page=2&_limit=10` | `200` — страница; всего записей в заголовке `X-Total-Count` |
| `GET` | `/users?_sort=name&_order=desc` | `200` — сортировка, комбинируется с пагинацией |
| `GET` | `/roles`, `/profile` | `200` — справочник ролей / профиль |
| `POST` | `/users` | `201` — созданный объект с новым `id` |
| `PUT` | `/users/1` | `200` — объект целиком заменён |
| `PATCH` | `/users/1` | `200` — объект с применёнными полями |
| `DELETE` | `/users/1` | `200` — пустой объект |

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
