/**
 * Форматирует YSON строку с отступами и переносами строк
 * @param input - сырая YSON строка (например: {"a"=1;"b"={"c"=2;}})
 * @param indentSize - размер отступа в пробелах (по умолчанию 2)
 * @param spacesForTabs - использовать пробелы вместо табов (по умолчанию true)
 * @returns отформатированная YSON строка
 */
export function formatYson(
  input: string,
  indentSize = 2,
  spacesForTabs = true,
): string {
  if (!input || typeof input !== 'string') {
    return input;
  }

  const indent = spacesForTabs ? ' '.repeat(indentSize) : '\t';
  let result = '';
  let currentIndent = 0;
  let inString = false;
  let escapeNext = false;
  let inComment = false;
  let commentType: 'line' | 'block' | null = null;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const nextChar = input[i + 1];
    const prevChar = input[i - 1];

    // Обработка escape-последовательностей в строках
    if (inString && escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }

    if (inString && char === '\\') {
      result += char;
      escapeNext = true;
      continue;
    }

    // Обработка строк
    if (char === '"' && !inComment) {
      inString = !inString;
      result += char;
      continue;
    }

    // Если мы внутри строки, просто добавляем символ
    if (inString) {
      result += char;
      continue;
    }

    // Обработка комментариев
    if (!inComment && char === '/' && nextChar === '/') {
      inComment = true;
      commentType = 'line';
      result += char;
      continue;
    }

    if (!inComment && char === '/' && nextChar === '*') {
      inComment = true;
      commentType = 'block';
      result += char;
      continue;
    }

    if (inComment && commentType === 'line' && char === '\n') {
      inComment = false;
      commentType = null;
      result += char;
      continue;
    }

    if (
      inComment &&
      commentType === 'block' &&
      char === '*' &&
      nextChar === '/'
    ) {
      result += char;
      continue;
    }

    if (
      inComment &&
      commentType === 'block' &&
      prevChar === '*' &&
      char === '/'
    ) {
      inComment = false;
      commentType = null;
      result += char;
      continue;
    }

    // Если внутри комментария, просто добавляем символ
    if (inComment) {
      result += char;
      continue;
    }

    // Обработка открывающих скобок/квадратных скобок
    if (char === '{' || char === '[' || char === '<') {
      result += char;

      // Проверяем, есть ли контент внутри (не пустая структура)
      let hasContent = false;
      let depth = 1;
      let j = i + 1;
      const openChar = char;
      const closeChar = char === '{' ? '}' : char === '[' ? ']' : '>';

      while (j < input.length && depth > 0) {
        const c = input[j];
        if (c === openChar) depth++;
        if (c === closeChar) depth--;
        if (depth > 0 && c.trim() !== '') {
          hasContent = true;
          break;
        }
        j++;
      }

      if (hasContent) {
        currentIndent++;
        result += '\n' + indent.repeat(currentIndent);
      }
      continue;
    }

    // Обработка закрывающих скобок/квадратных скобок
    if (char === '}' || char === ']' || char === '>') {
      // Убираем лишние пробелы перед закрывающей скобкой
      result = result.trimEnd();

      // Проверяем, была ли предыдущая открывающая скобка на этой же строке
      const lastNewline = result.lastIndexOf('\n');
      const afterLastNewline = result.substring(lastNewline + 1);
      const hasOpenBracket =
        afterLastNewline.includes('{') ||
        afterLastNewline.includes('[') ||
        afterLastNewline.includes('<');

      if (!hasOpenBracket && currentIndent > 0) {
        currentIndent--;
        result += '\n' + indent.repeat(currentIndent);
      } else if (currentIndent > 0) {
        currentIndent--;
      }

      result += char;
      continue;
    }

    // Обработка точки с запятой (разделитель элементов)
    if (char === ';') {
      result += char;

      // Проверяем, нужен ли перенос строки после точки с запятой
      // Не добавляем перенос, если следующий символ - закрывающая скобка
      if (
        nextChar &&
        nextChar !== '}' &&
        nextChar !== ']' &&
        nextChar !== '>'
      ) {
        result += '\n' + indent.repeat(currentIndent);
      }
      continue;
    }

    // Обработка пробелов и переносов строк - пропускаем их
    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      // Добавляем пробел только после определенных символов
      if (
        prevChar &&
        (prevChar === '=' || prevChar === ',' || prevChar === ':')
      ) {
        result += ' ';
      }
      continue;
    }

    // Все остальные символы добавляем как есть
    result += char;
  }

  return result.trim();
}
