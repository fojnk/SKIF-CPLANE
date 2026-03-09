# Cubes Module

Модуль для работы с кубами пайплайна.

## Ключевое изменение

**Разделение конфигурации на два источника:**

| Поле                     | Источник        | Описание                                                             |
| ------------------------ | --------------- | -------------------------------------------------------------------- |
| `config`                 | Основной JSON   | Данные кубов без `CubeID` (Name, InputsMapping, OutputNames, Params) |
| `additional_information` | cubeConfig JSON | Информация о базовых кубах (`CubeTypeID`, `Name`, `InputNames`)      |

### Почему так сделано

Раньше `CubeID` хранился в основном `config`:

```json
{
  "Worker": {
    "GraphConfig": {
      "Cubes": [{ "CubeID": 10, "Name": "MyCube", "OutputNames": ["out1"] }]
    }
  }
}
```

Теперь `CubeID` (переименован в `CubeTypeID`) хранится отдельно в `additional_information`:

```json
{
  "Cubes": [{ "CubeTypeID": 10, "Name": "MyCube", "InputNames": ["in1"] }]
}
```

А основной `config` содержит только данные без ID:

```json
{
  "Worker": {
    "GraphConfig": {
      "Cubes": [
        { "Name": "MyCube", "OutputNames": ["out1"], "InputsMapping": {...} }
      ]
    }
  }
}
```

## Структура модуля

```
cubes/
├── index.ts              # Экспорт всех модулей
├── README.md             # Этот файл
├── types.ts              # Все типы
│
├── list/                 # Effector модель списка кубов
│   ├── index.ts
│   └── model.ts
│
├── single/               # Effector модель одного куба
│   ├── index.ts
│   └── model.ts
│
└── graph/                # Утилиты для работы с графом
    ├── index.ts
    ├── utils.ts              # Базовые утилиты
    ├── parse-cube-config.ts  # Парсинг cubeConfig
    ├── merge-config.ts       # Объединение config + cubeConfig
    ├── validate-ports.ts     # Валидация InputNames/OutputNames
    ├── parse-graph.ts        # Парсинг графа (режим просмотра)
    ├── build-graph.ts        # Построение графа (режим редактирования)
    ├── layout.ts             # Layout графа (ELK, Dagre)
    └── cube-config-builder.ts # Построение cubeConfig из формы
```

## Основные типы (`types.ts`)

### Enum'ы

- `CubeType` — типы кубов (CUBE, RETRY, RESHARDER, RETRIER)
- `CubeIOType` — типы портов (STATIC, DYNAMIC, EMPTY)
- `MappingErrorType` — типы ошибок маппинга

### Интерфейсы кубов

- `PortInfo` — информация о порте (name + hash)
- `EditExperimentCube` — куб для редактирования
- `CubeWithId` — куб в JSON формате
- `ValidatedCubeData` — валидированные данные куба

### Интерфейсы графа

- `GraphNode` — нода графа
- `GraphEdge` — связь графа
- `CubesGraphParams` — результат парсинга графа

### Интерфейсы конфигов

- `CubeConfig`, `CubeConfigItem` — структура cubeConfig (additional_information)
- `ParsedExperimentConfig` — структура основного config
- `MergedConfigCube` — объединённый куб с данными из обоих источников

## Поток данных

### Режим просмотра (View)

```
┌─────────────────────────────────────────────────────────────┐
│  API Response                                                │
│  ├── config: "{...}"                                        │
│  └── additional_information: "{\"Cubes\":[...]}"            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  parseGraphConfig(config, cubeConfig, baseCubes)            │
│  ├── mergeConfigs() — объединяет данные                     │
│  ├── validateOutputNames() — валидация выходов              │
│  ├── validateInputNames() — валидация входов                │
│  └── возвращает CubesGraphParams                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  layoutGraph(nodes, edges)                                   │
│  └── ELK / Dagre layout                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  <Graph /> компонент React Flow                             │
└─────────────────────────────────────────────────────────────┘
```

### Режим редактирования (Edit)

```
┌─────────────────────────────────────────────────────────────┐
│  Загрузка                                                    │
│  initExperimentEditorValues(config, cubeConfig, formData, cubes)│
│  └── Инициализация формы с EditExperimentCube[]               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  React Final Form                                            │
│  └── values.Worker.GraphConfig.Cubes (Record<hash, cube>)   │
└─────────────────────────────────────────────────────────────┘
          │                                     │
          ▼                                     ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│  FormValuesObserver      │    │  CubeConfigObserver           │
│  convertCubesToFormFormat│    │  buildCubeConfigJson          │
│  → setCurrentConfig      │    │  → setCurrentCubeConfig       │
│  (без CubeID!)           │    │  (CubeTypeID + InputNames)    │
└──────────────────────────┘    └──────────────────────────────┘
          │                                     │
          ▼                                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Сохранение                                                  │
│  updateExperiment({                                            │
│    config: currentConfig,           // без CubeID           │
│    additional_information: currentCubeConfig                │
│  })                                                          │
└─────────────────────────────────────────────────────────────┘
```

## Примеры использования

### Парсинг графа (просмотр)

```typescript
import {
  parseGraphConfig,
  layoutGraph,
} from '@/modules/stream-flow/entities/cubes';

const graphData = parseGraphConfig(config, cubeConfig, baseCubes);
if (graphData) {
  const { nodes, edges } = await layoutGraph(graphData.nodes, graphData.edges);
  // Используем в React Flow
}
```

### Построение графа (редактирование)

```typescript
import {
  buildGraphFromCubes,
  layoutGraph,
} from '@/modules/stream-flow/entities/cubes';

const graphData = buildGraphFromCubes(cubesArray, {
  resharderInputSources: resharderPorts,
  hasResharderResources: true,
});

const { nodes, edges } = await layoutGraph(graphData.nodes, graphData.edges);
```

### Построение cubeConfig

```typescript
import { buildCubeConfigJson } from '@/modules/stream-flow/entities/cubes';

const cubesArray = Object.values(formValues.Worker.GraphConfig.Cubes);
const cubeConfigJson = buildCubeConfigJson(cubesArray);
// '{"Cubes":[{"CubeTypeID":10,"Name":"MyCube","InputNames":["in1"]}]}'
```

## InputsMapping — связи между кубами

### Типы маппингов

| Тип         | Источник данных                         | Поля маппинга                       |
| ----------- | --------------------------------------- | ----------------------------------- |
| `RESHARDER` | Resharder (входные данные пайплайна)    | `OutputPortHash`                    |
| `CUBE`      | Обычный куб или Retry куб (output порт) | `OutputCubeHash` + `OutputPortHash` |
| `RETRY`     | Retrier (агрегатор retry кубов)         | `RetryCube` (имя куба)              |

### Схема связей

```
┌─────────────┐
│  Resharder  │ ──(RESHARDER)──► входной порт куба
└─────────────┘

┌─────────────┐
│  Куб / Retry│ ──(CUBE)──────► входной порт куба
│   куб       │    (через output порт)
└─────────────┘

┌─────────────┐
│  Retrier    │ ──(RETRY)─────► входной порт куба
│ (виртуальный│    (по имени retry куба)
│    узел)    │
└─────────────┘
```

### Retry куб vs Retrier

- **Retry куб** — обычный куб с `CubeType.RETRY`, имеет стандартные input/output порты
- **Retrier** — виртуальный узел на графе, объединяет все retry кубы для передачи "retry событий"

### Примеры маппингов

```typescript
// От Resharder
{
  Type: CubeType.RESHARDER,
  OutputPortHash: 'resharder_port_abc123'
}

// От обычного куба (или retry куба через его output порт)
{
  Type: CubeType.CUBE,
  OutputCubeHash: 'cube_hash_xyz',
  OutputPortHash: 'port_hash_456'
}

// От Retrier (retry событие)
{
  Type: CubeType.RETRY,
  RetryCube: 'MyRetryCubeName'  // имя, не hash!
}
```
