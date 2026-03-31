import { useTheme } from '@gravity-ui/uikit';
import Editor, { useMonaco } from '@monaco-editor/react';
import React, { useRef, useEffect, useMemo } from 'react';

import { getMonacoOptions } from '@/modules/control-plane/entities/monaco';
import { registerYsonLanguage } from '@/shared/lib/monaco-yson';

interface Props {
  language?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  onMount?: (editor: any, monaco: any) => void;
  className?: string;
  options?: any;
  schema?: string;
  /** Отключить автоподсказки (включая $schema) */
  disableSuggestions?: boolean;
}

export const SFMonaco = ({
  language = 'json',
  value = '',
  onChange,
  onMount,
  className,
  options = {},
  schema,
  disableSuggestions = false,
}: Props) => {
  const isDarkTheme = useTheme() === 'dark';
  const editorRef = useRef<any>(null);
  const monaco = useMonaco();

  // Регистрируем YSON язык при монтировании Monaco
  const handleBeforeMount = useMemo(
    () => (monaco: any) => {
      try {
        // Проверяем, не зарегистрирован ли уже YSON
        const languages = monaco.languages.getLanguages();
        const ysonExists = languages.some((lang: any) => lang.id === 'yson');

        if (!ysonExists) {
          registerYsonLanguage();
        }
      } catch (error) {
        console.warn('Failed to register YSON language:', error);
      }
    },
    [],
  );

  const handleEditorDidMount = useMemo(
    () => (editor: any, monaco: any) => {
      editorRef.current = editor;
      monaco.editor.setTheme(isDarkTheme ? 'vs-dark' : 'vs');
      onMount?.(editor, monaco);
    },
    [isDarkTheme, onMount],
  );

  // Преобразуем строку схемы в объект для Monaco
  const schemaObject = React.useMemo(() => {
    if (!schema) return undefined;

    try {
      const parsedSchema = JSON.parse(schema);
      return {
        uri: parsedSchema.$schema,
        fileMatch: ['*'],
        schema: parsedSchema,
      };
    } catch {
      return undefined;
    }
  }, [schema]);

  // Управление схемой Monaco
  useEffect(() => {
    if (!monaco) return;

    if (schemaObject) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [schemaObject],
      });
    } else {
      // Очищаем схему если она не передана (чтобы сбросить глобальную схему от других редакторов)
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [],
      });
    }

    // Очистка схемы при размонтировании
    return () => {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: false,
        schemas: [],
      });
    };
  }, [monaco, schemaObject]);

  // Обновляем тему редактора при изменении темы (резервный вариант)
  useEffect(() => {
    const updateTheme = () => {
      const monaco = (window as any).monaco;
      if (monaco && editorRef.current) {
        const theme = isDarkTheme ? 'vs-dark' : 'vs';
        monaco.editor.setTheme(theme);

        // Проверяем, что тема действительно применилась
        setTimeout(() => {
          if (editorRef.current) {
            const currentTheme = editorRef.current.getOption(
              monaco.editor.EditorOption.theme,
            );
            if (currentTheme !== theme) {
              monaco.editor.setTheme(theme);
            }
          }
        }, 50);
      }
    };
    // Обновляем тему с задержкой
    setTimeout(updateTheme, 50);
  }, [isDarkTheme]);

  const defaultOptions = getMonacoOptions(true, 'on');

  const mergedOptions = useMemo(() => {
    const opts = { ...defaultOptions, ...options };
    if (disableSuggestions) {
      opts.quickSuggestions = false;
      opts.suggestOnTriggerCharacters = false;
    }
    return opts;
  }, [defaultOptions, options, disableSuggestions]);

  return (
    <Editor
      key={isDarkTheme ? 'dark' : 'light'}
      language={language}
      value={value}
      onChange={onChange}
      beforeMount={handleBeforeMount}
      onMount={handleEditorDidMount}
      className={className}
      options={mergedOptions}
    />
  );
};
