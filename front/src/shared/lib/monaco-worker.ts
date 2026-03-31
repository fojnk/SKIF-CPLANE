import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
// eslint-disable-next-line import/default
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// eslint-disable-next-line import/default
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
// Регистрация YQL языков для Monaco Editor
import 'monaco-yql-languages';

import MysqlWorker from './mysql.worker.js?worker';
import YamlWorker from './yaml.worker.js?worker';

self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    switch (label) {
      case 'json':
        return new jsonWorker();
      case 'yaml':
        return new YamlWorker();
      case 'sql':
        return new MysqlWorker();
      case 'yql':
      case 'yql_ansi':
      case 's-expression':
      case 'clickhouse':
        // Для YQL языков используем editor worker, так как специального worker'а нет
        return new editorWorker();
      case 'yson':
        // Для YSON используем стандартный editor worker (как и для YQL)
        return new editorWorker();
      default:
        return new editorWorker();
    }
  },
};

loader.config({ monaco });
