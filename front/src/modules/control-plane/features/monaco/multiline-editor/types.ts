export type MultilineEditorLanguage =
  | 'json'
  | 'yaml'
  | 'python'
  | 'yql'
  | 'plaintext';

export interface MultilineEditorPayload {
  /** Название параметра */
  paramName: string;
  /** Значение параметра */
  value: string;
  /** Язык редактора */
  language: MultilineEditorLanguage;
  /** Callback для сохранения изменений (если не указан - режим просмотра) */
  onSave?: (value: string) => void;
}
