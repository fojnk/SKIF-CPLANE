# Experiment Graph Viewer

Компоненты для визуализации и редактирования графа experiment с кубами, Resharder, Retrier и их связями.

## Компоненты

### `Graph` (graph.tsx)

Главный компонент графа. Использует React Flow.

- `nodeTypes` вынесены за пределы компонента (избегаем warning)
- Автоматический `fitView` при изменении нод
- Поддержка светлой/темной темы
- Режим редактирования (`isEditable`) с поддержкой создания/удаления связей
- Перетаскивание нод отключено (`nodesDraggable={false}`)

**Props:**

```typescript
interface GraphProps {
  nodes?: Node[];
  edges?: Edge[];
  selectedCubeHash?: string | null;
  centerOnCubeHash?: string | null;
  fitViewTrigger?: number;
  onCubeClick?: (cubeHash: string | null) => void;
  onCubeDelete?: (cubeHash: string, cubeName: string) => void;
  onResharderClick?: () => void;
  onConnectionCreate?: (connection: ConnectionData) => void;
  onConnectionDelete?: (connection: ConnectionData) => void;
  isEditable?: boolean;
  experiment_id?: number;
  experiment_name?: string;
  variables?: ExperimentVariableItem[] | null;
}
```

### `CubeGroupNode` (cube-group-node.tsx)

Отображает куб с портами.

- **Header**: иконка Cube + название + блок ошибки (иконка ⚠️ + код)
- **Ports**: input слева (Handle target), output справа (Handle source)
- **Порты используют `PortInfo`** с уникальными `hash` для идентификации

**Props:**

```typescript
interface CubeGroupNodeProps {
  data: {
    label: string;
    isExternal?: boolean;
    inputPorts?: PortInfo[]; // { name: string; hash: string }
    outputPorts?: PortInfo[];
    hasError?: boolean;
    errorCode?: string;
    selected?: boolean;
    cubeHash?: string;
    cubeId?: number;
    baseCubeName?: string;
  };
}
```

### `ResharderNode` (resharder-node.tsx)

Отображает Resharder с выходными портами.

- **Header**: название "Resharder"
- **Ports**: только output справа (Handle source)
- **Порты используют `PortInfo`** с уникальными `hash`
- **Цвет**: жёлтый
- **Условие отображения**: показывается если есть output порты ИЛИ есть ресурсы Resharder в конфиге

**Props:**

```typescript
interface ResharderNodeProps {
  data: {
    label: string;
    outputPorts?: PortInfo[];
  };
}
```

### `RetrierNode` (retrier-node.tsx)

Отображает Retrier — виртуальный источник данных для Retry кубов.

- **Header**: название "Retrier"
- **Ports**: только output справа (Handle source)
- **Порты**: каждый порт соответствует имени Retry куба в графе
- **Цвет**: фиолетовый (как у RetryNode)
- **Позиция**: располагается под Resharder слева от кубов

**Условие отображения**: Retrier появляется только если в графе есть хотя бы один куб с типом `CubeType.RETRY`.

**Props:**

```typescript
interface RetrierNodeProps {
  data: {
    label: string;
    outputPorts?: PortInfo[];
  };
}
```

**Логика маппингов с Retrier:**

1. **Из Retrier в SimpleCube** (тип `CIT_RETRY`):

   ```json
   "inputPort": {
     "Type": "CIT_RETRY",
     "CubeName": "RetryCubeName"
   }
   ```

   На графе: `Retrier.RetryCubeName` → `SimpleCube.inputPort`

2. **Из SimpleCube в RetryCube** (тип `CIT_CUBE`):

   ```json
   "retry_data": {
     "Type": "CIT_CUBE",
     "CubeName": "SimpleCube",
     "OutputName": "output"
   }
   ```

   На графе: `SimpleCube.output` → `RetryCube.retry_data`

3. **Из RetryCube в другой куб** (тип `CIT_CUBE`):
   ```json
   "input": {
     "Type": "CIT_CUBE",
     "CubeName": "RetryCube",
     "OutputName": "dead_letters"
   }
   ```
   На графе: `RetryCube.dead_letters` → `OtherCube.input`

### `RetryNode` (retry-node.tsx)

Отображает Retry куб (специальный тип).

- **Иконка**: ArrowsRotateLeft
- **Ports**: input слева (Handle target), output справа (Handle source)
- **Цвет**: фиолетовый

**Props:**

```typescript
interface RetryNodeProps {
  data: {
    label: string;
    inputPorts?: PortInfo[];
    outputPorts?: PortInfo[];
    hasError?: boolean;
    errorCode?: string;
    selected?: boolean;
    cubeHash?: string;
    cubeId?: number;
    baseCubeName?: string;
  };
}
```

### `PortNode` (port-node.tsx)

Отдельный порт (не используется напрямую — порты встроены в CubeGroupNode/ResharderNode/RetryNode/RetrierNode).

## Типы нод React Flow

```typescript
const nodeTypes = {
  cubeGroup: CubeGroupNode,
  resharder: ResharderNode,
  retrier: RetrierNode,
  retry: RetryNode,
  port: PortNode,
};
```

## Режим редактирования

При `isEditable={true}`:

1. **Создание связей**: Drag-and-drop от output порта к input порту
2. **Удаление связей**: Клик по edge для выделения + Backspace/Delete
3. **Удаление кубов**: Выделение куба + Backspace/Delete
4. **Валидация**: Запрещены self-loop (связи внутри одного куба)
5. **Визуальная обратная связь**: Выделенный edge подсвечивается и анимируется

```typescript
// Данные о соединении
interface ConnectionData {
  sourceNodeId: string; // ID ноды-источника ("Resharder", "Retrier" или Hash куба)
  sourcePortHash: string; // Hash выходного порта
  targetNodeId: string; // ID ноды-цели (Hash куба)
  targetPortHash: string; // Hash входного порта
}
```

## Layout (entities/cubes/graph/layout.ts)

### `layoutGraph` (async, ELK) — **основной**

ELK layout с продвинутым автоматическим расположением.

- Алгоритм: `layered` с минимизацией пересечений
- Направление: `RIGHT` (слева направо)
- Spacing: 200px между слоями, 80px между нодами
- Минимизация пересечений: `INTERACTIVE`
- **Resharder и Retrier** располагаются слева от кубов (Retrier под Resharder с отступом 20px)
- **Асинхронный** — не блокирует UI при больших графах
- Использует `SmartStepEdge` для автоматического обхода нод

### `dagreLayout` (sync, fallback)

Dagre layout — запасной вариант.

- Направление: слева направо (LR)
- Spacing: 180px между слоями, 80px между нодами

### `simpleLayout` (sync, fallback)

Топологическая сортировка по слоям с минимизацией пересечений.

## Размеры (константы)

```typescript
PORT_HEIGHT = 27px          // Высота порта
CUBE_HEADER_HEIGHT = 46px   // Высота заголовка куба
HEADER_HEIGHT = 32px        // Высота заголовка resharder/retrier
MIN_CUBE_WIDTH = 200px      // Минимальная ширина куба
CHAR_WIDTH = 8px            // Примерная ширина символа

// Высота куба
height = CUBE_HEADER_HEIGHT + (inputCount + outputCount) * PORT_HEIGHT

// Ширина куба
width = max(MIN_WIDTH, maxNameLength * CHAR_WIDTH + padding)
```

## Graph Utils (entities/cubes/graph/)

### `parseGraphConfig`

Парсит JSON конфигурацию и возвращает данные для графа.

```typescript
function parseGraphConfig(
  config: string,
  cubeConfig: string,
  baseCubes: CubeListDC[],
): CubesGraphParamsWithDebug | null;
```

### `buildGraphFromCubes`

Строит граф из массива `EditExperimentCube[]` (для режима редактирования).

```typescript
interface BuildGraphOptions {
  resharderInputSources?: PortInfo[];
  hasResharderResources?: boolean;
}

function buildGraphFromCubes(
  cubes: EditExperimentCube[],
  options: BuildGraphOptions,
): CubesGraphParams;
```

## Типы данных

### `PortInfo`

```typescript
interface PortInfo {
  name: string; // Отображаемое имя порта
  hash: string; // Уникальный идентификатор для связей
}
```

### `GraphNode`

```typescript
interface GraphNode {
  id: string; // cube_HASH8 для кубов, "Resharder"/"Retrier" для служебных нод
  label: string; // Имя куба для отображения
  cubeHash?: string;
  cubeId?: number;
  baseCubeName?: string;
  outputPorts: PortInfo[];
  inputPorts: PortInfo[];
  type: CubeType; // CUBE, RESHARDER, RETRY, RETRIER
  hasError?: boolean;
  errorCode?: string;
}
```

### `CubeType`

```typescript
enum CubeType {
  CUBE = 'CIT_CUBE',
  RESHARDER = 'CIT_RESHARDER',
  RETRY = 'CIT_RETRY',
  RETRIER = 'Retrier',
}
```

### `CubesGraphParams`

```typescript
interface CubesGraphParams {
  nodes: GraphNode[];
  edges: GraphEdge[];
  validatedCubes?: ValidatedCubeData[];
}
```

## Логика ошибок

### Cube

| Условие               | Описание                                  |
| --------------------- | ----------------------------------------- |
| ❌ Empty CubeName     | `cube.Name` отсутствует или пустая строка |
| ❌ No CubeID          | `cube.CubeID` отсутствует                 |
| ❌ Duplicate CubeName | Имя куба дублируется                      |

**Отображение**: Иконка ⚠️ + текст "error"

### Port

| Условие            | Отображение              |
| ------------------ | ------------------------ |
| ❌ Empty port name | Иконка ⚠️ + "empty name" |

### Resharder

| Условие                                 | Отображение |
| --------------------------------------- | ----------- |
| ❌ Нет портов И нет Resources.Resharder | Скрыт       |
| ✅ Есть порты ИЛИ есть ресурсы          | Показан     |

## Использование

### Режим просмотра

```tsx
import { Graph } from '@/modules/stream-flow/shared/components/graph/experiment';
import {
  parseGraphConfig,
  layoutGraph,
} from '@/modules/stream-flow/entities/cubes';

const graphData = parseGraphConfig(config, cubeConfig, baseCubes);

// ELK layout асинхронный
const { nodes, edges } = await layoutGraph(graphData.nodes, graphData.edges);

<Graph nodes={nodes} edges={edges} onCubeClick={handleCubeClick} />;
```

### Режим редактирования

```tsx
import { Graph } from '@/modules/stream-flow/shared/components/graph/experiment';
import {
  buildGraphFromCubes,
  layoutGraph,
} from '@/modules/stream-flow/entities/cubes';

const graphData = buildGraphFromCubes(cubes, {
  resharderInputSources,
  hasResharderResources: Boolean(values?.Resources?.Resharder),
});

// ELK layout асинхронный
const { nodes, edges } = await layoutGraph(graphData.nodes, graphData.edges);

<Graph
  nodes={nodes}
  edges={edges}
  isEditable={true}
  onCubeClick={handleCubeClick}
  onConnectionCreate={handleConnectionCreate}
  onConnectionDelete={handleConnectionDelete}
/>;
```

## Логика кликов по графу

### Клики по нодам

| Нода          | Область клика | Действие                                                                            |
| ------------- | ------------- | ----------------------------------------------------------------------------------- |
| **CubeGroup** | Вся нода      | Выделяет куб на графе и в списке кубов, переключает на таб "Cubes", скроллит к кубу |
| **Retry**     | Вся нода      | Аналогично CubeGroup — выделяет retry-куб                                           |
| **Resharder** | Вся нода      | Переключает на таб "Experiment", сворачивает все disclosure кроме "Resharder"         |
| **Retrier**   | Вся нода      | Нет специального действия                                                           |

### Двустороннее связывание выделения кубов

1. **Граф → Список**: Клик по кубу на графе выделяет его в списке (синяя рамка), раскрывает disclosure и скроллит к нему
2. **Список → Граф**: Клик по кнопке с иконкой `NodesRight` в `CubeViewer` выделяет куб на графе и центрирует граф на нём
3. **Сброс выделения**: Повторный клик по выделенному кубу на графе снимает выделение с обоих (граф и список)

### Архитектура состояний

```
ExperimentFormViewer
├── selectedCubeHash (string | null) — хэш выделенного куба
├── activeTab (TabId) — активный таб ('experiment' | 'worker' | 'cubes')
├── focusedParam (string | null) — имя disclosure для принудительного раскрытия
│
├── WorkerViewGraph
│   ├── selectedCubeHash → подсветка куба на графе + центрирование
│   ├── onCubeSelect(hash) → обновляет selectedCubeHash
│   └── onResharderClick() → activeTab = 'experiment', focusedParam = 'Resharder'
│
└── ExperimentViewTabs
    ├── activeTab → контролируемое переключение табов
    ├── focusedParam → контролирует какой disclosure раскрыт
    └── selectedCubeHash → для WorkerViewCubes
        └── WorkerViewCubes
            ├── selectedCubeHash → подсветка куба в списке
            └── onCubeSelect(hash) → обновляет selectedCubeHash (кнопка NodesRight)
```

### Стили курсора

- **CubeGroup, Retry, Resharder, Retrier**: `cursor: pointer` при наведении на всю группу
