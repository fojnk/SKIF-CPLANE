import { ParamsDC } from '@/modules/stream-flow/shared/types';

// Тип формы из react-final-form
export interface FormApi {
  change: (name: string, value: unknown) => void;
  getState: () => {
    values: Record<string, unknown>;
  };
}

export interface ResharderEditPayload {
  /** Параметры формы */
  formData: ParamsDC[];
  /** JSON строка с конфигурацией */
  config: string;
  /** Начальные значения из конфига */
  initialValues: Record<string, unknown>;
  /** Form API для сохранения изменений */
  form: FormApi;
  /** Список имён доступных переменных для валидации ${variableName} */
  variableNames?: Set<string>;
}
