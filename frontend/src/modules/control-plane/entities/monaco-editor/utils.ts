import { MultilineEditorLanguage } from '@/modules/control-plane/features/monaco/multiline-editor';
import { ParamsStringTypeDC } from '@/modules/control-plane/shared/api/__generated__/data-contracts';

/**
 * Преобразует тип constraint в язык для Monaco Editor
 */
export const getMonacoLanguage = (
  stringType?: ParamsStringTypeDC | 'yaml',
): MultilineEditorLanguage => {
  switch (stringType) {
    case ParamsStringTypeDC.Json:
      return 'json';
    case ParamsStringTypeDC.YQL:
      return 'yql';
    case ParamsStringTypeDC.Python:
      return 'python';
    case ParamsStringTypeDC.Text:
      return 'plaintext';
    case 'yaml':
      return 'yaml';
    default:
      return 'plaintext';
  }
};

/**
 * Проверяет, является ли constraint multiline полем
 */
export const isMultilineConstraint = (constraint?: {
  multiline?: boolean;
  string_type?: ParamsStringTypeDC;
}): boolean => {
  return (
    Boolean(constraint?.multiline) ||
    constraint?.string_type === ParamsStringTypeDC.Text ||
    constraint?.string_type === ParamsStringTypeDC.Python ||
    constraint?.string_type === ParamsStringTypeDC.Json ||
    constraint?.string_type === ParamsStringTypeDC.YQL
  );
};
