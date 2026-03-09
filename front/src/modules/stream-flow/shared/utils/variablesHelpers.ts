import { ParamsStringTypeDC } from '@/modules/stream-flow/shared/api/__generated__/data-contracts';

export const VARIABLE_TYPES = [
  { value: 'string', content: 'String', theme: 'info' },
  { value: 'int', content: 'Integer', theme: 'success' },
  { value: 'json', content: 'JSON', theme: 'warning' },
  { value: 'yql', content: 'YQL', theme: 'danger' },
  { value: 'python', content: 'Python', theme: 'utility' },
];

export const getTypeTheme = (
  type: string,
): 'info' | 'success' | 'warning' | 'danger' | 'utility' | 'normal' => {
  switch (type) {
    case 'string':
      return 'info';
    case 'int':
      return 'success';
    case 'json':
      return 'warning';
    case 'yql':
      return 'danger';
    case 'python':
      return 'utility';
    default:
      return 'normal';
  }
};

export const getTypeLabel = (type: string): string => {
  switch (type) {
    case 'string':
      return 'STR';
    case 'int':
      return 'INT';
    case 'json':
      return 'JSON';
    case 'yql':
      return 'YQL';
    case 'python':
      return 'PY';
    default:
      return type;
  }
};

export const getEditorLanguage = (
  type: string,
): 'yql' | 'json' | 'python' | 'plaintext' => {
  switch (type) {
    case 'string':
      return 'plaintext';
    case 'int':
      return 'plaintext';
    case 'json':
      return 'json';
    case 'yql':
      return 'yql';
    case 'python':
      return 'python';
    default:
      return 'plaintext';
  }
};

/**
 * Получает тему для Label на основе ParamsStringTypeDC
 * Использует те же цвета, что и getTypeTheme для согласованности
 */
export const getStringTypeTheme = (
  stringType: ParamsStringTypeDC,
): 'info' | 'warning' | 'danger' | 'utility' => {
  switch (stringType) {
    case ParamsStringTypeDC.Text:
      return 'info';
    case ParamsStringTypeDC.Json:
      return 'warning';
    case ParamsStringTypeDC.Python:
      return 'utility';
    case ParamsStringTypeDC.YQL:
      return 'danger';
    default:
      return 'info';
  }
};

/**
 * Получает тему для Label на основе языка редактора Monaco
 * Использует те же цвета, что и getTypeTheme для согласованности
 */
export const getEditorLanguageTheme = (
  language: 'json' | 'yaml' | 'python' | 'yql' | 'plaintext',
): 'info' | 'warning' | 'danger' | 'utility' => {
  switch (language) {
    case 'json':
      return 'warning';
    case 'yql':
      return 'danger';
    case 'python':
      return 'utility';
    case 'plaintext':
      return 'info';
    case 'yaml':
      return 'info'; // yaml не определен в getTypeTheme, используем info
    default:
      return 'info';
  }
};
