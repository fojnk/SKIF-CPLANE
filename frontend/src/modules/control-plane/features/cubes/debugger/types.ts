import type { ParseDebugInfo } from '@/modules/control-plane/entities/cubes';

export type DebuggerMode = 'initial' | 'current';

export interface CubesDebuggerPayload {
  /** Режим отображения: initial (начальные данные) или current (текущие) */
  mode: DebuggerMode;
  /** Debug информация о парсинге (только для initial) */
  debugInfo: ParseDebugInfo | null;
  /** JSON кубов из Experiment Config */
  cubesConfigJson: string;
  /** JSON из additional_information */
  cubeConfigJson: string;
  /** JSON данных React Flow графа */
  graphDataJson: string;
}
