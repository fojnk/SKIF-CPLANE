# Project Graph

Компонент для отображения графа проекта с нодами типа **Experiment** и **Dataset**.

## Использование

```tsx
import { ProjectGraph } from '@/modules/stream-flow/shared/components/graph/project-new';
import { buildProjectGraph } from '@/modules/stream-flow/entities/projects/graph';

// Построение графа из API данных
const graph = buildProjectGraph(apiNodes);

<ProjectGraph
  nodes={graph.nodes}
  edges={graph.edges}
  selectedNodeId={selectedNodeId}
  onNodeClick={handleNodeClick}
  onPaneClick={handlePaneClick}
/>;
```

## Компоненты

| Компонент        | Описание                                    |
| ---------------- | ------------------------------------------- |
| `ProjectGraph`   | Основной компонент графа                    |
| `ExperimentNode`   | Нода experiment с иконкой и цветом по статусу |
| `DatasetNode` | Нода dataset с иконкой базы данных       |

## Статусы Experiment

Ноды experiment окрашиваются в зависимости от статуса:

- `UNKNOWN` — серый
- `OK` — зелёный
- `WARNING` — оранжевый
- `ERROR` — красный
- `PENDING` — синий

## Типы

Типы определены в `@/modules/stream-flow/entities/projects/graph`:

- `ProjectNode`, `ProjectEdge` — типы для ReactFlow
- `ExperimentNodeData`, `DatasetNodeData` — данные нод
- `ExperimentStatus` — статусы experiment

## Утилиты

В `@/modules/stream-flow/entities/projects/graph`:

- `buildProjectGraph(apiNodes)` — преобразует API данные в формат ReactFlow с автоматическим layout
