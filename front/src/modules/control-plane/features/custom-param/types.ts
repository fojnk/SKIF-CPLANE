export type CustomParamMode = 'view' | 'edit';

export interface CustomParamPayload {
  /** Название параметра */
  paramName: string;
  /** Значение параметра (JSON строка) */
  value: string;
  /** Режим: просмотр или редактирование */
  mode: CustomParamMode;
  /** Callback для сохранения изменений (только в режиме edit) */
  onSave?: (value: string) => void;
}
