import * as monaco from 'monaco-editor';

/**
 * Регистрация языка YSON для Monaco Editor
 * YSON - формат сериализации данных от Яндекса (YTsaurus)
 *
 * Основные отличия от JSON:
 * - Разделитель ключ-значение: `=` вместо `:`
 * - Разделитель элементов: `;` вместо `,`
 * - Специальный тип entity: `#`
 * - Поддержка атрибутов: `<key=value>literal`
 * - Типы: int64, uint64 (с суффиксом `u`)
 * - Boolean: %true, %false
 *
 * Примеры:
 * - {"id"=2; "name"="Alice"; "active"=%true}
 * - <"type"="user"> {"id"=123u}
 * - [1; 2; 3; #]
 *
 * Основано на официальной спецификации YTsaurus YSON
 * https://ytsaurus.tech/docs/en/user-guide/storage/yson
 */
export function registerYsonLanguage() {
  const id = 'yson';

  // Регистрируем язык с метаданными
  monaco.languages.register({
    id,
    extensions: ['.yson'],
    aliases: ['YSON', 'yson'],
    mimetypes: ['application/x-yson', 'text/x-yson'],
  });

  // Конфигурация языка
  monaco.languages.setLanguageConfiguration(id, {
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['<', '>'], // Для атрибутов
      ['(', ')'], // Могут использоваться в некоторых YSON-конструкциях
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '<', close: '>' },
      { open: '(', close: ')' },
      { open: '"', close: '"', notIn: ['string'] },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '<', close: '>' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
    ],
  });

  // Monarch tokenizer для подсветки синтаксиса
  // Основано на спецификации YSON и примерах из YTsaurus
  monaco.languages.setMonarchTokensProvider(id, {
    tokenizer: {
      root: [
        { include: '@whitespace' },

        // Containers - map and list
        [/{/, { token: 'delimiter.bracket', next: '@map' }],
        [/\[/, { token: 'delimiter.bracket', next: '@list' }],

        { include: '@value' },
      ],

      // Map (dictionary) - { key = value; key2 = value2 }
      map: [
        { include: '@whitespace' },
        [/}/, { token: 'delimiter.bracket', next: '@pop' }],

        // Keys: string or identifier - используем ОДИН токен для всех ключей
        [/"([^"\\]|\\.)*"/, { token: 'key', next: '@afterKey' }],
        [/[A-Za-z_][A-Za-z0-9_.-]*/, { token: 'key', next: '@afterKey' }],

        [/;/, 'delimiter'],
      ],

      afterKey: [
        { include: '@whitespace' },
        [/=/, { token: 'delimiter', next: '@mapValue' }],
      ],

      mapValue: [
        { include: '@whitespace' },
        { include: '@value' },
        // После значения должна быть точка с запятой, которая возвращает в map
        [/;/, { token: 'delimiter', next: '@map' }],
        // Если видим закрывающую скобку - это конец текущего объекта
        [/(?=})/, { token: '', next: '@map' }], // lookahead - если впереди }, возвращаемся в map (который обработает })
      ],

      // List - [value1; value2; value3]
      list: [
        { include: '@whitespace' },
        [/\]/, { token: 'delimiter.bracket', next: '@pop' }],
        { include: '@value' },
        [/;/, 'delimiter'],
      ],

      // Values (scalars, attributes, entity, containers)
      value: [
        // Strings
        [/"([^"\\]|\\.)*"/, 'string'],

        // Attributes block: <...> (map-fragment with metadata)
        [/</, { token: 'delimiter', next: '@attrs' }],

        // Entity - encoded by '#'
        [/#\b|#/, 'constant.language.entity'],

        // Booleans - %true/%false (официальный формат YSON)
        [/%(true|false)\b/, 'constant.language.boolean'],

        // Booleans без % (для совместимости с JSON)
        [/\b(true|false)\b/, 'constant.language.boolean'],

        // Special numeric values - inf, +inf, -inf (case-insensitive)
        [/[+-]?inf\b/i, 'constant.numeric.infinity'],

        // Special numeric value - nan (case-insensitive)
        [/\bnan\b/i, 'constant.numeric.nan'],

        // Numbers (order matters!)
        [/[+-]?\d+u\b/, 'number.uint'], // uint64 with 'u' suffix
        [/[+-]?\d+\b/, 'number.int'], // int64
        [/[+-]?\d+(\.\d+)?([eE][+-]?\d+)?\b/, 'number.float'], // double

        // Nested containers
        [/{/, { token: 'delimiter.bracket', next: '@map' }],
        [/\[/, { token: 'delimiter.bracket', next: '@list' }],

        // Identifiers (unquoted keys or values)
        [/[A-Za-z_][A-Za-z0-9_.-]*/, 'identifier'],
      ],

      // Attributes - <key=value; key2=value2>
      attrs: [
        { include: '@whitespace' },

        // Keys in attributes (string or identifier)
        [/"([^"\\]|\\.)*"/, 'attribute.name'],
        [/[A-Za-z_][A-Za-z0-9_.-]*/, 'attribute.name'],

        [/=/, 'delimiter'],
        [/;/, 'delimiter'],

        // Values in attributes
        { include: '@value' },

        [/>/, { token: 'delimiter', next: '@pop' }], // end of attributes
      ],

      // Whitespace and comments
      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\/.*$/, 'comment'], // Line comment - всё от // до конца строки
        [/\/\*/, { token: 'comment', next: '@blockComment' }], // Start block comment
      ],

      // Block comment - все до */
      blockComment: [
        [/[^*]+/, 'comment'],
        [/\*\//, { token: 'comment', next: '@pop' }],
        [/\*/, 'comment'],
      ],
    },
  });

  // Определяем темы для YSON
  // Светлая тема
  monaco.editor.defineTheme('yson-light', {
    base: 'vs',
    inherit: false, // Отключаем наследование, чтобы избежать конфликтов
    rules: [
      // Ключи
      { token: 'key', foreground: '0451A5' },

      // Строки
      { token: 'string', foreground: 'A31515' },

      // Числа
      { token: 'number.uint', foreground: '098658' },
      { token: 'number.int', foreground: '098658' },
      { token: 'number.float', foreground: '098658' },

      // Булевы значения и константы
      { token: 'constant.language.entity', foreground: 'AF00DB' },
      { token: 'constant.language.boolean', foreground: '0000FF' },
      { token: 'constant.numeric.infinity', foreground: 'AF00DB' },
      { token: 'constant.numeric.nan', foreground: 'AF00DB' },

      // Атрибуты
      { token: 'attribute.name', foreground: 'E09B28' },

      // Комментарии
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
    ],
    colors: {},
  });

  // Тёмная тема
  monaco.editor.defineTheme('yson-dark', {
    base: 'vs-dark',
    inherit: false, // Отключаем наследование, чтобы избежать конфликтов
    rules: [
      // Ключи
      { token: 'key', foreground: '9CDCFE' },

      // Строки
      { token: 'string', foreground: 'CE9178' },

      // Числа
      { token: 'number.uint', foreground: 'B5CEA8' },
      { token: 'number.int', foreground: 'B5CEA8' },
      { token: 'number.float', foreground: 'B5CEA8' },

      // Булевы значения и константы
      { token: 'constant.language.entity', foreground: 'C586C0' },
      { token: 'constant.language.boolean', foreground: '569CD6' },
      { token: 'constant.numeric.infinity', foreground: 'C586C0' },
      { token: 'constant.numeric.nan', foreground: 'C586C0' },

      // Атрибуты
      { token: 'attribute.name', foreground: 'DCDCAA' },

      // Комментарии
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
    ],
    colors: {},
  });
}
