/**
 * Простой ANSI парсер, вдохновленный ansi-to-html
 * Конвертирует ANSI escape коды в HTML с инлайн стилями
 */

// ANSI цвета (стандартная палитра)
const ANSI_COLORS: Record<string, string> = {
  // Основные цвета (30-37, 40-47)
  '0': '#000000', // Black
  '1': '#D32F2F', // Red
  '2': '#388E3C', // Green
  '3': '#F57C00', // Yellow
  '4': '#1976D2', // Blue
  '5': '#7B1FA2', // Magenta
  '6': '#0097A7', // Cyan
  '7': '#AAAAAA', // White/Gray

  // Яркие цвета (90-97, 100-107)
  '8': '#555555', // Bright Black (Gray)
  '9': '#FF5252', // Bright Red
  '10': '#69F0AE', // Bright Green
  '11': '#FFD740', // Bright Yellow
  '12': '#448AFF', // Bright Blue
  '13': '#E040FB', // Bright Magenta
  '14': '#18FFFF', // Bright Cyan
  '15': '#FFFFFF', // Bright White
};

interface AnsiState {
  fg?: string;
  bg?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

/**
 * Экранирует HTML специальные символы
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Оборачивает текст в span с соответствующими стилями
 */
function wrapWithStyle(text: string, state: AnsiState): string {
  if (!text) return '';

  // Экранируем HTML
  const escapedText = escapeHtml(text);

  // Если нет стилей, возвращаем как есть
  if (
    !state.fg &&
    !state.bg &&
    !state.bold &&
    !state.italic &&
    !state.underline
  ) {
    return escapedText;
  }

  // Собираем стили
  const styles: string[] = [];

  if (state.fg) {
    styles.push(`color:${state.fg}`);
  }

  if (state.bg) {
    styles.push(`background-color:${state.bg}`);
  }

  if (state.bold) {
    styles.push('font-weight:bold');
  }

  if (state.italic) {
    styles.push('font-style:italic');
  }

  if (state.underline) {
    styles.push('text-decoration:underline');
  }

  return `<span style="${styles.join(';')}">${escapedText}</span>`;
}

/**
 * Обрабатывает ANSI коды и обновляет состояние стилей
 */
function processAnsiCodes(codes: number[], state: AnsiState): AnsiState {
  const newState = { ...state };

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];

    if (code === 0) {
      // Reset all
      return {};
    } else if (code === 1) {
      // Bold
      newState.bold = true;
    } else if (code === 3) {
      // Italic
      newState.italic = true;
    } else if (code === 4) {
      // Underline
      newState.underline = true;
    } else if (code === 22) {
      // Normal intensity (not bold)
      newState.bold = false;
    } else if (code === 23) {
      // Not italic
      newState.italic = false;
    } else if (code === 24) {
      // Not underlined
      newState.underline = false;
    } else if (code >= 30 && code <= 37) {
      // Foreground color (standard)
      newState.fg = ANSI_COLORS[String(code - 30)];
    } else if (code === 39) {
      // Default foreground
      delete newState.fg;
    } else if (code >= 40 && code <= 47) {
      // Background color (standard)
      newState.bg = ANSI_COLORS[String(code - 40)];
    } else if (code === 49) {
      // Default background
      delete newState.bg;
    } else if (code >= 90 && code <= 97) {
      // Foreground color (bright)
      newState.fg = ANSI_COLORS[String(code - 90 + 8)];
    } else if (code >= 100 && code <= 107) {
      // Background color (bright)
      newState.bg = ANSI_COLORS[String(code - 100 + 8)];
    }
  }

  return newState;
}

/**
 * Конвертирует ANSI escape коды в HTML
 */
export function ansiToHtml(text: string): string {
  if (!text) return '';

  // Регулярное выражение для поиска ANSI escape последовательностей
  // eslint-disable-next-line no-control-regex
  const ansiRegex = /\x1b\[([0-9;]*)m/g;

  const parts: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let currentState: AnsiState = {};

  while ((match = ansiRegex.exec(text)) !== null) {
    // Добавляем текст перед escape последовательностью
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index);
      parts.push(wrapWithStyle(textBefore, currentState));
    }

    // Парсим коды
    const codes = match[1].split(';').map(Number);
    currentState = processAnsiCodes(codes, currentState);

    lastIndex = match.index + match[0].length;
  }

  // Добавляем оставшийся текст
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex);
    parts.push(wrapWithStyle(textAfter, currentState));
  }

  return parts.join('');
}
