import {
  DtoBatchRunResultDC,
  DtoCubeRunResultDC,
  DtoRunResultsDC,
  RequestsExperimentValidateDataItemDC,
} from '@/modules/control-plane/shared/api/__generated__/data-contracts';

export type InputDataMode = 'yt_sample' | 'manual';
export type DebugTabId = 'data' | 'errors' | 'logs' | 'cubes';
export type CubeTabId = 'inputs' | 'outputs' | 'logs';

export interface DebugExperimentPayload {
  experiment_id: number;
  name: string;
  config: string;
  should_read_yt_sample: boolean;
  data_sets?: RequestsExperimentValidateDataItemDC[][];
}

export interface PortOption {
  value: string;
  content: string;
  sourceName: string;
  outputName: string;
}

export interface PortDataModalPayload {
  ports: PortOption[];
  selectedPort: string;
  portDataMap: Record<string, string>;
  onPortChange: (portName: string) => void;
  onDataChange: (portName: string, data: string) => void;
}

export interface CubeDataModalPayload {
  cubeRuns: CubeRuns;
  selectedCube?: string;
}

// Используем типы из API контрактов
export type CubeRunResult = DtoCubeRunResultDC;
export type BatchRunResult = DtoBatchRunResultDC;
export type RunResults = DtoRunResultsDC;

// Типы для работы с cube_runs
export type CubeRuns = Record<string, CubeRunResult>;
