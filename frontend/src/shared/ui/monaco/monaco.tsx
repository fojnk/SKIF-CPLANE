import Editor, { EditorProps, useMonaco } from '@monaco-editor/react';
import '@/shared/lib/monaco-worker';
import React, { useEffect } from 'react';

const MonacoEditor: React.FC<
  EditorProps & {
    schema?: {
      uri: string;
      fileMatch?: string[];
      schema?: any;
    };
  }
> = ({ schema, ...props }) => {
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco && schema) {
      const diagnosticsOptions = {
        validate: true,
        schemas: [schema],
      };
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions(
        diagnosticsOptions,
      );
    }
  }, [monaco, schema]);

  return <Editor {...props} />;
};

export default MonacoEditor;
