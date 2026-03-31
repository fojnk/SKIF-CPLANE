import { ParamsDC } from '@/modules/control-plane/shared/types';

export interface ResharderViewPayload {
  /** Параметры формы */
  formData: ParamsDC[];
  /** JSON строка с конфигурацией */
  config: string;
  /** Начальные значения из конфига */
  initialValues: Record<string, unknown>;
  /** Список имён доступных переменных для подсветки ${variableName} */
  variableNames?: string[];
  /** Callback при клике на переменную */
  onVariableClick?: (variableName: string) => void;
}
