import { useTheme } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useCallback, useRef, useEffect, useMemo } from 'react';

import { monacoModel } from '@/modules/control-plane/entities/monaco';
import { MonacoDialogWrapper } from '@/modules/control-plane/shared/ui/sf-monaco';
import Monaco from '@/shared/ui/monaco';

interface Props {
  config: string;
}

export const JsonViewer = ({ config }: Props) => {
  const fontSizeNumber = useUnit(monacoModel.$fontSizeNumber);
  const isDarkTheme = useTheme() === 'dark';
  const editorRef = useRef<any>(null);

  // Определяем язык и форматируем содержимое
  const { language, value } = useMemo(() => {
    if (!config) return { language: 'plaintext', value: '' };

    try {
      // Пытаемся распарсить как JSON
      const parsed = JSON.parse(config);
      // Если успешно, возвращаем отформатированный JSON
      return {
        language: 'json',
        value: JSON.stringify(parsed, null, 2),
      };
    } catch {
      // Если не JSON, возвращаем как plaintext
      return {
        language: 'plaintext',
        value: config,
      };
    }
  }, [config]);

  const handleEditorDidMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;
      // Устанавливаем тему сразу после монтирования
      monaco.editor.setTheme(isDarkTheme ? 'vs-dark' : 'vs');
    },
    [isDarkTheme],
  );

  // Обновляем тему при изменении isDarkTheme
  useEffect(() => {
    if (editorRef.current) {
      const monaco = (window as any).monaco;
      if (monaco) {
        monaco.editor.setTheme(isDarkTheme ? 'vs-dark' : 'vs');
      }
    }
  }, [isDarkTheme]);

  return (
    <MonacoDialogWrapper style={{ height: '100%', width: '100%' }}>
      <Monaco
        language={language}
        value={value}
        onMount={handleEditorDidMount}
        className="monaco-viewer"
        options={{
          readOnly: true,
          renderWhitespace: 'all',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: fontSizeNumber,
          automaticLayout: true,
          wordWrap: 'on' as const,
          lineNumbers: 'on' as const,
        }}
      />
    </MonacoDialogWrapper>
  );
};
