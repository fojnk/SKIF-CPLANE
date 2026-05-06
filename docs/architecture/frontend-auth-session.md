# Авторизация и сессия во фронтенде Control Plane

Кратко: SPA общается с CPLANE API через `fetch` с **`credentials: 'same-origin'`** — после успешного входа сессия опирается на **cookie**, которые выставляет backend (браузер подставляет их автоматически). Отдельного хранения access-токена в `localStorage` для основного API не требуется.

## Вход и регистрация

| Действие | Где в коде | HTTP |
|----------|------------|------|
| Форма логина | [`frontend/src/modules/control-plane/pages/login/ui/page.tsx`](../../frontend/src/modules/control-plane/pages/login/ui/page.tsx), [`pages/login/model.ts`](../../frontend/src/modules/control-plane/pages/login/model.ts) | `POST /auth/login` через [`modules/control-plane/api/api.ts`](../../frontend/src/modules/control-plane/api/api.ts) `loginFx` |
| Регистрация | [`pages/register/`](../../frontend/src/modules/control-plane/pages/register/) | `POST /auth/register` (`registerFx` в том же `api.ts`) |
| OAuth redirect | `authorizeFx`, `exchangeTokenFx` в [`api.ts`](../../frontend/src/modules/control-plane/api/api.ts) | `/auth/authorize`, обмен кода на токен |

После успешного `loginFx` вызывается **`userModel.fetchCurrentUser()`** — загрузка профиля и дальнейшая навигация (список проектов или `sessionStorage` redirect).

Параметр **`?auto=1`** на странице логина триггерит **`autoLoginFx`** (демо/стенд): повторный вход дефолтными учётными данными.

## Текущий пользователь и capabilities

| Запрос | Файл | Назначение |
|--------|------|------------|
| `GET` who-am-i | [`entities/session/user/model/requests.ts`](../../frontend/src/modules/control-plane/entities/session/user/model/requests.ts) `currentUserQuery` → `oauth.whoAmIList` | Данные пользователя (`$user`) |
| `GET` `/api/v2/me/capabilities` | тот же модуль, `currentUserCapabilitiesQuery` | Глобальные флаги: `can_create_namespace`, `can_manage_acl`, `is_root` (`$capabilities`) |

После успешного who-am-i автоматически стартует загрузка **capabilities** (см. `entities/session/user/model/events.ts`).

## Защита маршрутов

[`frontend/src/routing/router.ts`](../../frontend/src/routing/router.ts):

1. **Неавторизованный пользователь** открывает приватный маршрут → редирект на **`/login`**.
2. У маршрута может быть **`requiredCapability`** (`can_create_namespace` | `can_manage_acl` | `is_root`) — если capability нет, редирект на **`/`** (см. [`shared/lib/routing`](../../frontend/src/shared/lib/routing)).

Права на **конкретные объекты** (проект, эксперимент, …) приходят с API сущностей; UI проверяет их через [`shared/utils/authz.ts`](../../frontend/src/modules/control-plane/shared/utils/authz.ts) (`can(...)`, `hasCapability(...)`): например `RightStartExperiment` для кнопки запуска эксперимента.

## Ошибки HTTP и обновление сессии

[`frontend/src/modules/control-plane/shared/api/api-error-handler.tsx`](../../frontend/src/modules/control-plane/shared/api/api-error-handler.tsx):

- **401** (кроме страницы логина и запроса refresh) → `refreshSessionModel.refresh()` — см. ниже.
- **500** на **`/auth/who_am_i`** → сброс пользователя и переход на логин.
- Прочие ошибки API → уведомление с текстом и опционально **`X-Request-Id`**.

[`entities/session/refresh/model.ts`](../../frontend/src/modules/control-plane/entities/session/refresh/model.ts): **`GET /auth/refresh`** (`oauth.refreshList`). Успех — повторная загрузка пользователя; провал — logout, сохранение URL в `SESSION_REDIRECT_KEY`, переход на **`/login?auto=1`**.

Базовый HTTP-клиент: [`shared/api/http.ts`](../../frontend/src/shared/api/http.ts), [`shared/api/common/http-client.ts`](../../frontend/src/shared/api/common/http-client.ts) (`credentials: 'same-origin'`).

## Связь с ACL на backend

Модель ролей и правил описана в [`entities/acl.md`](../entities/acl.md). Фронт не дублирует проверку ACL сервера; **`can` / capabilities** только скрывают или включают элементы UI. Итоговый запрет по-прежнему возвращает API.

## См. также

- [`entities/acl.md`](../entities/acl.md)
- [`control-loop.md`](control-loop.md) — запуск эксперимента и статус
- [`frontend-experiment-graph.md`](frontend-experiment-graph.md) — редактор графа
