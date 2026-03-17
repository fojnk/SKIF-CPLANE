# Experiment Debug Feature

Функциональность для отладки пайплайнов с поддержкой YSON формата данных.

## YSON Format

YSON (Yet Another Serialization Object Notation) - формат сериализации данных от Яндекса (YTsaurus).

### Основные отличия от JSON:

| Особенность | JSON | YSON |
|-------------|------|------|
| Разделитель ключ-значение | `:` | `=` |
| Разделитель элементов | `,` | `;` |
| Boolean значения | `true`, `false` | `%true`, `%false` |
| Специальный тип | `null` | `#` (entity) |
| Числа uint64 | нет | `123u` |
| Infinity/NaN | нет | `%inf`, `%-inf`, `%nan` |
| Атрибуты | нет | `<key=value>literal` |

### Примеры YSON:

**Простой объект:**
```yson
{"id"=2; "name"="Alice"}
```

**С boolean:**
```yson
{"active"=%true; "deleted"=%false}
```

**Массивы:**
```yson
{"items"=[1; 2; 3]}
```

**uint64:**
```yson
{"user_id"=9007199254740992u}
```

**Entity:**
```yson
{"value"=#}
```

**С атрибутами:**
```yson
<"type"="user"; "version"=1> {"id"=123; "name"="Bob"}
```

**Ключи в кавычках:**
```yson
{"quoted key"="value"; unquoted_key="another value"}
```

**Вложенные структуры:**
```yson
{
  "user"={
    "id"=123u;
    "name"="Alice";
    "tags"=["admin"; "verified"]
  };
  "meta"=<"timestamp"=1234567890> #
}
```

**Специальные значения:**
```yson
{"temperature"=inf; "error"=nan; "missing"=#}
```

**Совместимость:**
```yson
{"active"=true; "deleted"=false}  // также работает без %
```

**С комментариями:**
```yson
{
  "id"=42;  // Идентификатор пользователя
  /* Мультилайн
     комментарий */
  "data"=[1; 2; 3]
}
```

## Monaco Editor

В проекте реализована кастомная подсветка синтаксиса YSON для Monaco Editor на основе Monarch tokenizer.

Файл: `src/shared/lib/monaco-yson.ts`

### Возможности:

- ✅ **Контекстная подсветка**: ключи отличаются от значений
- ✅ **Ключи в кавычках**: `"quoted key"=value` и `unquoted_key=value`
- ✅ **Все типы YSON**: `#`, `%true`, `%false`, `123u`, `inf`, `nan`
- ✅ **Совместимость**: поддержка `true`/`false` без `%`
- ✅ **Атрибуты**: `<key=value; key2=value2>literal`
- ✅ **Map/List структуры**: правильная вложенность `{...}` и `[...]`
- ✅ **Escape-последовательности**: `\n`, `\t`, `\u0000` в строках
- ✅ **Комментарии**: `//` и `/* */` (расширение для удобства)
- ✅ **Auto-closing**: автозакрытие скобок и кавычек
- ✅ **Две темы**: `yson-light` и `yson-dark`

### Использование:

```tsx
<SFMonaco
  language="yson"
  value={ysonString}
  onChange={handleChange}
  options={{ readOnly: false }}
/>
```

### Поддерживаемые токены:

**Ключи (подсвечиваются отдельно):**
- Unquoted: `key`, `key_name`, `key.name`, `key-name`
- Quoted: `"key"`, `"quoted key with spaces"`

**Операторы:**
- `=` - присвоение (ключ-значение)
- `;` - разделитель элементов

**Числа:**
- int64: `123`, `-456`
- uint64: `123u`, `9007199254740992u`
- double: `-45.67`, `1.23e-4`, `3.14159`
- Special: `inf`, `-inf`, `+inf`, `nan` (case-insensitive)

**Boolean:**
- Официальный: `%true`, `%false`
- Совместимость: `true`, `false`

**Entity:**
- `#` - пустое значение

**Строки:**
- `"text"` с escape: `\n`, `\t`, `\\`, `\"`, `\u0000`

**Контейнеры:**
- Map: `{key=value; key2=value2}`
- List: `[1; 2; 3]`

**Атрибуты:**
- `<type="user"; id=1> {data}`

**Комментарии (расширение):**
- `// line comment`
- `/* block comment */`

## Компоненты

- **ExperimentDebug** - основной компонент отладки
- **DebugSidebar** - боковая панель с вкладками Data/Logs/Cubes
- **PortDataModal** - модальное окно для редактирования YSON данных портов
- **CubeViewer** - компонент для отображения результатов выполнения кубов

## API

Debug использует endpoint: `/api/v1/experiment/validations/run`

Параметры:
- `experiment_id` - ID пайплайна
- `config` - конфигурация пайплайна (строка)
- `should_read_yt_sample` - использовать ли YT sample данные (`true`) или manual YSON данные (`false`)

Ответ содержит структуру:
```json
{
  "run_result": {
    "batch_runs": [
      {
        "cube_runs": {
          "CubeName": {
            "inputs": { "input_name": "YSON data" },
            "outputs": { "output_name": "YSON data" },
            "logs": ["log line 1", "log line 2"]
          }
        }
      }
    ]
  }
}
```

## Вкладка Cubes

Вкладка "Cubes" отображает результаты выполнения кубов (`cube_runs`) из debug-результата.

### Структура:

1. **Селект кубов** - выбор куба из `cube_runs` (по умолчанию выбирается первый)
2. **Вкладки внутри куба**:
   - **Inputs** - входные данные куба
     - Селект для выбора конкретного input
     - Monaco редактор с YSON данными (read-only)
   - **Outputs** - выходные данные куба
     - Селект для выбора конкретного output
     - Monaco редактор с YSON данными (read-only)
   - **Logs** - логи выполнения куба
     - LogViewer для отображения логов

### Пример использования:

```tsx
import { CubeViewer } from '@/modules/stream-flow/features/experiment/debug';

<CubeViewer cubeRuns={cubeRuns} />
```

Где `cubeRuns` - объект типа `CubeRuns`:
```typescript
// Используем типы из API контрактов
import {
  DtoCubeRunResultDC,
  DtoRunResultsDC,
} from '@/modules/stream-flow/shared/api/__generated__/data-contracts';

// DtoCubeRunResultDC из API:
// {
//   inputs?: Record<string, string[]>;   // Массивы YSON строк
//   outputs?: Record<string, string[]>;  // Массивы YSON строк
//   logs?: Record<string, any>[];        // Массив объектов логов
// }

export type CubeRuns = Record<string, DtoCubeRunResultDC>;
```
