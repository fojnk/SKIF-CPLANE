import { useTheme } from '@gravity-ui/uikit';
import { useCallback } from 'react';

/**
 * Хук для создания обработчика монтирования Monaco Editor с автоматической настройкой темы
 * @returns Функция handleEditorDidMount для передачи в onMount prop Monaco Editor
 */
export const useMonacoThemeHandler = () => {
  const theme = useTheme();

  return useCallback(
    (editor: any, monaco: any) => {
      // Устанавливаем тему сразу после монтирования
      monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    },
    [theme],
  );
};
