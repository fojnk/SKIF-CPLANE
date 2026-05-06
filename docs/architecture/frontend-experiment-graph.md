# Граф эксперимента во фронтенде

Описание цепочки **данные формы → доменный граф → layout → React Flow** в редакторе эксперимента (страница [`pages/editor`](../../frontend/src/modules/control-plane/pages/editor)).

## Назначение

Визуально отобразить **Worker GraphConfig** (кубы, Resharder, Retrier, связи через `InputsMapping`) и дать редактировать связи в режиме worker. Для сценария **супервизор-only** (`models[]` без редактирования worker-графа) поддерживается отдельный режим **supervisor graph** с нодами датасетов.

## Ключевые компоненты

| Слой | Файлы | Роль |
|------|------|------|
| Контейнер графа редактора | [`pages/.../experiment-edit/worker-edit-graph.tsx`](../../frontend/src/modules/control-plane/pages/editor/ui/modules/experiment/experiment-edit/worker-edit-graph.tsx) | Форма (`react-final-form`), `graphData` из кубов или супервизорного конфига, вызов ELK `layoutGraph`, локальный state `nodes` / `edges` |
| Обёртка React Flow | [`shared/components/graph/experiment/graph.tsx`](../../frontend/src/modules/control-plane/shared/components/graph/experiment/graph.tsx) | `ReactFlowProvider`, `useNodesState` / `useEdgesState`, события connect / delete / клавиатура, кастомные типы нод и `SmartStepEdge` |
| Построение доменного графа | [`entities/cubes/graph/build-graph.ts`](../../frontend/src/modules/control-plane/entities/cubes/graph/build-graph.ts) | `buildGraphFromCubes` — из массива кубов формирует `GraphNode[]` и `GraphEdge[]` |
| Парсинг супервизорного JSON | [`entities/cubes/graph/parse-graph.ts`](../../frontend/src/modules/control-plane/entities/cubes/graph/parse-graph.ts) | `parseGraphConfig` для режима supervisor |
| Layout | [`entities/cubes/graph/layout.ts`](../../frontend/src/modules/control-plane/entities/cubes/graph/layout.ts) | **`layoutGraph`** (ELK), вспомогательные `simpleLayout` / `dagreLayout`, **`graphEdgesToReactFlowEdges`** — маппинг доменных рёбер в формат `@xyflow/react` |

Стили нод и рёбер: [`shared/components/graph/experiment/graph.module.scss`](../../frontend/src/modules/control-plane/shared/components/graph/experiment/graph.module.scss).

## Поток данных (worker)

1. **`values.Worker.GraphConfig.Cubes`** из формы → массив кубов.
2. **`buildGraphFromCubes`** (+ опции Resharder, каталог кубов) → абстрактные ноды и рёбра (`GraphNode` / `GraphEdge`).
3. **`layoutGraph`** асинхронно считает позиции (ELK), возвращает **`Node[]` и `Edge[]`** для React Flow.
4. Результат кладётся в state родителя и передаётся в **`<Graph nodes={...} edges={...} />`**.

Чтобы при удалении связи не оставалась «висящая» линия до завершения ELK, перед асинхронным layout список рёбер **синхронно** приводится к данным формы (`graphEdgesToReactFlowEdges` + фильтр по уже отрисованным нодам) — см. комментарии в `worker-edit-graph.tsx`.

## Редактирование связей

- Создание: drag от handle к handle → `onConnectionCreate` → обновление **`InputsMapping`** целевого куба (или маппинг Resharder/Retrier/другого куба в зависимости от источника).
- Удаление: выделение ребра и **Delete/Backspace**, либо механизм удаления рёбер React Flow → `onConnectionDelete` → удаление соответствующего входного маппинга / записей датасетов в supervisor-режиме.

Обработчики реализованы в **`worker-edit-graph.tsx`** (`handleConnectionCreate`, `handleConnectionDelete`).

## Режим supervisor graph

При **`supervisorGraphMode`** граф строится из **`parseGraphConfig`** и списка моделей **`values.models`**; дополнительно подмешиваются ноды датасетов и связи input/output датасетов к моделям (алиасы из `input_datasets` / `output_datasets`). Редактирование типичных worker-связей отключено на уровне UX, но связи с датасетами могут меняться через те же хендлеры.

## Зависимости npm

- **`@xyflow/react`** — холст графа.
- **`@tisoap/react-flow-smart-edge`** — тип ребра `smart` (ортогональные линии).
- **`elkjs`** — расчёт раскладки в **`layoutGraph`**.

## См. также

- [`entities/cube.md`](../entities/cube.md) — каталог кубов
- [`entities/experiment.md`](../entities/experiment.md) — конфиг эксперимента и API
- [`architecture/control-loop.md`](control-loop.md)
- [`architecture/frontend-auth-session.md`](frontend-auth-session.md)
