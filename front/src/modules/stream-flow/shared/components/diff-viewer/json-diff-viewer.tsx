import { useTheme } from '@gravity-ui/uikit';
import { DiffEditor } from '@monaco-editor/react';
import { useUnit } from 'effector-react';
import React, { useCallback, useRef, useEffect, useMemo } from 'react';

import { monacoModel } from '@/modules/stream-flow/entities/monaco';
import { MonacoDialogWrapper } from '@/modules/stream-flow/shared/ui/sf-monaco';

export const JsonDiffViewer = ({
  originalJson,
  modifiedJson,
}: {
  originalJson: string;
  modifiedJson: string;
}) => {
  const [fontSizeNumber, renderSideBySide, collapseUnchangedRegions] = useUnit([
    monacoModel.$fontSizeNumber,
    monacoModel.$renderSideBySide,
    monacoModel.$collapseUnchangedRegions,
  ]);
  const isDarkTheme = useTheme() === 'dark';
  const editorRef = useRef<any>(null);

  // Форматируем JSON для отображения
  const formattedOriginalJson = useMemo(() => {
    if (!originalJson) return '';
    try {
      const parsed = JSON.parse(originalJson);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Если не валидный JSON, возвращаем как есть
      return originalJson;
    }
  }, [originalJson]);

  const formattedModifiedJson = useMemo(() => {
    if (!modifiedJson) return '';
    try {
      const parsed = JSON.parse(modifiedJson);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Если не валидный JSON, возвращаем как есть
      return modifiedJson;
    }
  }, [modifiedJson]);

  const handleEditorDidMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;
      // Устанавливаем тему сразу после монтирования
      monaco.editor.setTheme(isDarkTheme ? 'vs-dark' : 'vs');

      // Применяем сворачивание неизмененных регионов через API с небольшой задержкой
      if (collapseUnchangedRegions && !editor.isDisposed?.()) {
        setTimeout(() => {
          if (!editor.isDisposed?.()) {
            try {
              // Пытаемся применить экспериментальные опции
              (editor as any).updateOptions({
                experimental: {
                  collapseUnchangedRegions: true,
                  showMovedCodeBlocks: true,
                },
              });
            } catch (error) {
              console.warn(
                'Collapse unchanged regions not supported in this Monaco version:',
                error,
              );
            }
          }
        }, 100);
      }
    },
    [isDarkTheme, collapseUnchangedRegions],
  );

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      if (editorRef.current && !editorRef.current.isDisposed?.()) {
        try {
          editorRef.current.dispose();
        } catch (error) {
          console.warn('Error disposing editor:', error);
        }
      }
    };
  }, []);

  // Обновляем тему при изменении isDarkTheme
  useEffect(() => {
    if (editorRef.current) {
      const monaco = (window as any).monaco;
      if (monaco) {
        monaco.editor.setTheme(isDarkTheme ? 'vs-dark' : 'vs');
      }
    }
  }, [isDarkTheme]);

  // Обновляем сворачивание неизмененных регионов при изменении collapseUnchangedRegions
  useEffect(() => {
    if (editorRef.current && !editorRef.current.isDisposed?.()) {
      try {
        (editorRef.current as any).updateOptions({
          experimental: {
            collapseUnchangedRegions,
            showMovedCodeBlocks: true,
          },
        });
      } catch (error) {
        console.warn('Failed to update collapse unchanged regions:', error);
      }
    }
  }, [collapseUnchangedRegions]);

  return (
    <MonacoDialogWrapper style={{ height: '100%' }}>
      <DiffEditor
        className="monaco-viewer"
        language="json"
        original={formattedOriginalJson}
        modified={formattedModifiedJson}
        onMount={handleEditorDidMount}
        options={{
          readOnly: true,
          renderSideBySide,
          renderWhitespace: 'all',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: fontSizeNumber,
          automaticLayout: true,
          wordWrap: 'on' as const,
          lineNumbers: 'on' as const,
          // Алгоритм диффа для лучшей работы сворачивания
          diffAlgorithm: 'advanced',
        }}
      />
    </MonacoDialogWrapper>
  );
};
