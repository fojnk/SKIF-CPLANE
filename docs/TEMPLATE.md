# Шаблон страницы документации

Новые документы в `docs/architecture/`, `docs/entities/` (в будущем `docs/services/`, `docs/guides/`) оформляйте по этому шаблону. Заголовки **H2** ниже — фиксированные якоря для поиска и кросс-ссылок.

---

## Назначение

Кратко (2–4 предложения): зачем сущность или документ, границы ответственности.

## Связь с другими сущностями

- Список связей (кто родитель, кто потребитель).
- При необходимости — блок `mermaid` (`flowchart` / `sequenceDiagram`).

## Модель данных

- Таблицы PostgreSQL (`t_*`, представления `v_*`).
- Ссылка на фрагмент схемы: [`database/cplane.dbml`](database/cplane.dbml) с якорем по строкам, например `database/cplane.dbml#L101-L108` (GitHub/GitLab откроют нужный участок).

## HTTP API

Таблица: метод, путь, краткое назначение, ссылка на handler-файл в `backend/internal/handlers/private/`.

## Сервис

- Пакет `backend/internal/service/...`
- Ключевые методы и их роль.

## DTO / requests / responses

Пути к файлам в `backend/internal/entities/dto/`, `requests/`, `responses/`, `setters/`, `validation/`, `models/` (что применимо).

## Репозиторий и SQL

- [`backend/internal/repository/repository.go`](../backend/internal/repository/repository.go) как фасад.
- Конкретные запросы: `backend/internal/db/queries/*.sql`.

## Версионирование

Если есть: `*_config_v`, `*_v`, указатели текущей версии на родительской таблице. Иначе: «не применимо».

## Журнал изменений

Таблицы `t_*_update_log`, сервис логирования (`internal/service/history/update_log`), хендлеры логов.

## ACL

Объект ACL (`acl.Namespace`, `acl.Project`, …), атрибуты (`acl.MetaAttribute`, …), действия (`acl.Read`, `acl.Edit`, …). См. [`backend/internal/pkg/acl`](../backend/internal/pkg/acl).

## См. также

Ссылки на смежные markdown в `docs/` и на [`docs/README.md`](README.md).

---

### Ссылки на код из вложенных папок

Из `docs/entities/*.md` и `docs/architecture/*.md` на корень репозитория:

- Backend: `../../backend/...`
- Схема БД: `../database/cplane.dbml`
- Корневые файлы: `../../docker-compose.yml`, `../../README.md`

Из `docs/README.md` на backend: `../backend/...`
