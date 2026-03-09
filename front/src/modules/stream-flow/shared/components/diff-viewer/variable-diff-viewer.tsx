import { Flex, useTheme } from '@gravity-ui/uikit';
import { DiffEditor } from '@monaco-editor/react';
import { useUnit } from 'effector-react';
import React, { FC, useCallback, useRef, useEffect } from 'react';

import { monacoModel } from '@/modules/stream-flow/entities/monaco';
import { MonacoDialogWrapper } from '@/modules/stream-flow/shared/ui/sf-monaco';

export interface DiffMessage {
  message?: string;
  left?: string;
  right?: string;
}

interface Props {
  language: string;
  original: string;
  modified: string;
  showHeader?: boolean;
  version1?: number | string;
  version2?: number | string;
  headVersion?: number;
  message?: string | DiffMessage;
}

export const VariableDiffEditor: FC<Props> = ({
  language,
  original,
  modified,
  showHeader = true,
  version1,
  version2,
  headVersion,
  message,
}) => {
  const [fontSizeNumber, renderSideBySide, collapseUnchangedRegions] = useUnit([
    monacoModel.$fontSizeNumber,
    monacoModel.$renderSideBySide,
    monacoModel.$collapseUnchangedRegions,
  ]);

  const isDarkTheme = useTheme() === 'dark';
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = useCallback(
    (editor: any, monaco: any) => {
      editorRef.current = editor;
      monaco.editor.setTheme(isDarkTheme ? 'vs-dark' : 'vs');

      // Применяем сворачивание неизмененных регионов через API с небольшой задержкой
      if (collapseUnchangedRegions && !editor.isDisposed?.()) {
        setTimeout(() => {
          if (!editor.isDisposed?.()) {
            try {
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

  useEffect(() => {
    return () => {
      if (editorRef.current && !editorRef.current.isDisposed?.()) {
        try {
          editorRef.current.dispose();
        } catch (error) {
          console.warn('Error disposing diff editor:', error);
        }
      }
    };
  }, []);

  const getVersionLabel = (versionNumber?: number | string) => {
    if (!versionNumber) return 'Original';
    if (typeof versionNumber === 'string') return versionNumber;
    const isHead = headVersion !== undefined && versionNumber === headVersion;
    return `Version ${versionNumber}${isHead ? ' (head)' : ''}`;
  };

  const version1Label = version1 ? getVersionLabel(version1) : 'Original';
  const version2Label = version2 ? getVersionLabel(version2) : 'Head';
  const style = {
    width: '100%',
    marginTop: '-14px',
    fontSize: '13px',
    paddingBottom: '3px',
    opacity: 0.7,
  };
  const renderHeader = () => {
    if (!showHeader) return null;

    // Если передан message
    if (message) {
      // Если message - строка, выводим её
      if (typeof message === 'string') {
        return (
          <Flex direction="row" style={style} justifyContent="center">
            <Flex>{message}</Flex>
          </Flex>
        );
      }

      // Если message - объект
      // Для side-by-side режима используем left и right
      if (renderSideBySide && (message.left || message.right)) {
        return (
          <Flex direction="row" style={style}>
            <Flex style={{ width: '50%' }} justifyContent="center">
              {message.left || version1Label}
            </Flex>
            <Flex style={{ width: '50%' }} justifyContent="center">
              {message.right || version2Label}
            </Flex>
          </Flex>
        );
      }

      // Для inline режима используем общее message
      if (message.message) {
        return (
          <Flex direction="row" style={style} justifyContent="center">
            <Flex>{message.message}</Flex>
          </Flex>
        );
      }
    }

    if (renderSideBySide) {
      return (
        <Flex direction="row" style={style}>
          <Flex style={{ width: '50%' }} justifyContent="center">
            {version1Label}
          </Flex>
          <Flex style={{ width: '50%' }} justifyContent="center">
            {version2Label}
          </Flex>
        </Flex>
      );
    }

    return (
      <Flex direction="row" style={style} justifyContent="center">
        <Flex>
          Comparing {version1Label.toLowerCase()} with{' '}
          {version2Label.toLowerCase()}
        </Flex>
      </Flex>
    );
  };

  return (
    <MonacoDialogWrapper
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {renderHeader()}
      <DiffEditor
        className="monaco-viewer"
        language={language}
        original={original}
        modified={modified}
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
          diffAlgorithm: 'advanced',
        }}
      />
    </MonacoDialogWrapper>
  );
};
