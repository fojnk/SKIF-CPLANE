/**
 * Основные типы для работы с кубами
 */

import { DtoCubeTypeDC } from '@/modules/control-plane/shared/api/__generated__/data-contracts';

// ============================================================================
// Базовые enum'ы
// ============================================================================

/**
 * Типы входных данных для маппинга (значения из DtoCubeTypeDC)
 */
export enum CubeType {
  RESHARDER = DtoCubeTypeDC.Resharder,
  CUBE = DtoCubeTypeDC.CubeT,
  RETRY = DtoCubeTypeDC.Retry,
  RETRIER = 'Retrier', // Виртуальный тип для ноды Retrier (источник данных для retry кубов)
}

/**
 * Тип входов/выходов куба
 */
export enum CubeIOType {
  STATIC = 'static',
  DYNAMIC = 'dynamic',
  EMPTY = 'empty',
}

// ============================================================================
// Типы портов
// ============================================================================

/**
 * Информация о порте с уникальным hash
 */
export interface PortInfo {
  name: string; // Имя порта (OutputName или InputName)
  hash: string; // Уникальный hash (port_X, resharder_X, retrier_X)
}

// ============================================================================
// Типы маппингов
// ============================================================================

/**
 * Маппинг входных данных (формат JSON конфига)
 */
export interface CubeInputMapping {
  Type: CubeType;
  OutputName?: string; // Не используется для CIT_RETRY
  CubeName?: string; // Используется для CIT_CUBE и CIT_RETRY
}

/**
 * Маппинг входных данных для редактирования (с hash вместо имён)
 */
export interface EditCubeInputMapping {
  Type: CubeType; // Тип маппинга
  OutputPortHash?: string; // Hash порта выхода (от куба или resharder)
  OutputCubeHash?: string; // Hash куба-источника (для CIT_CUBE)
  // Имя retry куба-источника (для RETRY) - устарело, используйте RetryCubeHash
  RetryCube?: string;
  // Hash retry куба-источника (для RETRY) - используется вместо RetryCube
  RetryCubeHash?: string;
}

// ============================================================================
// Типы кубов
// ============================================================================

/**
 * Базовый интерфейс куба
 */
export interface BaseCube {
  Name: string;
  InputsMapping: Record<string, CubeInputMapping>;
  OutputNames?: string[];
}

/**
 * Параметры куба - любой объект с произвольной структурой
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CubeParams = Record<string, any>;

/**
 * Полный интерфейс куба с параметрами
 */
export type Cube = BaseCube & {
  [key: string]: CubeParams;
};

/**
 * Куб с ID (используется в конфигурации воркера)
 * InputsMapping и InputNames опциональны - не выводим пустые значения в JSON
 */
export interface CubeWithId {
  Name: string;
  CubeID?: number;
  CubeType?: CubeType;
  InputNames?: string[];
  InputsMapping?: Record<string, CubeInputMapping>;
  OutputNames?: string[];
  // Index signature для доступа к параметрам куба по имени
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Куб для редактирования пайплайна
 */
export interface EditExperimentCube {
  Name: string;
  CubeID: number;
  Hash: string;
  CubeType: CubeType;
  InputType: CubeIOType;
  OutputType: CubeIOType;
  /** Произвольное текстовое описание экземпляра куба в конфиге (ключ Description / description в JSON) */
  Description?: string;
  InputNames?: PortInfo[];
  OutputNames?: PortInfo[];
  ParamsName?: string;
  CubeParams?: string; // JSON строка с описанием параметров куба
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Params?: Record<string, any>; // Текущие значения параметров куба
  InputsMapping: Record<string, EditCubeInputMapping>;
}

/**
 * Информация о том, какой куб использует выход dropped куба
 */
export interface DroppedCubeOutputMapping {
  /** Имя выходного порта dropped куба */
  outputName: string;
  /** Имя куба, который использует этот выход */
  targetCubeName: string;
  /** Имя входного порта целевого куба */
  targetInputName: string;
}

/**
 * Невалидный маппинг, который был удалён при парсинге
 */
export interface DroppedMapping {
  /** Имя куба, у которого был этот маппинг */
  cubeName: string;
  /** Имя входного порта */
  inputName: string;
  /** Тип источника: CIT_CUBE, CIT_RESHARDER, CIT_RETRY */
  sourceType: string;
  /** Имя куба-источника (для CIT_CUBE и CIT_RETRY) */
  sourceCubeName?: string;
  /** Имя выходного порта источника */
  sourceOutputName?: string;
  /** Причина удаления */
  reason: string;
}

/**
 * Dropped куб - куб без CubeID (не найден в cubeConfig или cubesList)
 * Используется для отображения кубов, которые не удалось распознать
 */
export interface DroppedCube {
  /** Имя куба из конфига */
  Name: string;
  /** Причина, почему куб был dropped */
  reason: 'no_cube_type_id' | 'cube_not_found_in_list';
  /** Имена входных портов (из InputsMapping ключей) */
  InputNames?: PortInfo[];
  /** Имена выходных портов */
  OutputNames?: PortInfo[];
  /** Маппинги выходов — какие кубы используют выходы этого dropped куба */
  OutputMappings?: DroppedCubeOutputMapping[];
  /** Параметры куба (если есть) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Params?: Record<string, any>;
  /** Тип куба (если известен) */
  CubeType?: CubeType;
}

// ============================================================================
// Типы для графа
// ============================================================================

/**
 * Типы edges для React Flow
 */
export type EdgeType = 'default' | 'straight' | 'step' | 'smoothstep';

/**
 * Нода графа
 */
export interface GraphNode {
  id: string; // Уникальный идентификатор (cube_HASH8)
  label: string; // Отображаемое имя (Name куба)
  cubeHash?: string; // Уникальный хеш куба для идентификации
  cubeId?: number; // ID базового куба
  baseCubeName?: string; // Имя базового куба (опционально)
  /** Текст из конфига (Description у куба / description у модели супервизора) */
  modelDescription?: string;
  outputPorts: PortInfo[]; // Список выходов с hash
  inputPorts: PortInfo[]; // Список входов с hash
  type: CubeType; // Тип ноды (CUBE, RESHARDER или RETRY)
  hasError?: boolean; // Флаг ошибки
  errorCode?: string; // Код ошибки для отображения
}

/**
 * Edge графа
 */
export interface GraphEdge {
  id: string; // Уникальный ID связи
  source: string; // ID исходной ноды
  outputPortHash: string; // Hash порта выхода
  target: string; // ID целевой ноды
  inputPortHash: string; // Hash порта входа
  edgeType?: EdgeType; // Тип edge
}

// ============================================================================
// Типы ошибок
// ============================================================================

/**
 * Типы ошибок маппинга
 */
export enum MappingErrorType {
  INVALID_INPUT = 'invalid_input',
  MISSING_CUBE_NAME = 'missing_cube_name',
  CUBE_NOT_FOUND = 'cube_not_found',
  INVALID_OUTPUT = 'invalid_output',
  INVALID_CUBE_TYPE = 'invalid_cube_type', // Куб существует, но имеет неверный тип (например, CIT_RETRY требует RETRY куб)
}

/**
 * Ошибка маппинга
 */
export interface MappingError {
  type: MappingErrorType;
  name: string;
  /** Имя входного порта (для контекста ошибки) */
  inputPortName?: string;
  /** Имя source куба (для контекста ошибки) */
  sourceName?: string;
}

// ============================================================================
// Типы для валидации
// ============================================================================

/**
 * Валидированный маппинг входа для отображения
 */
export interface ValidatedInputMapping {
  inputPortName: string;
  type: CubeType;
  sourceName: string;
  outputPortName: string;
  isValid: boolean;
  errors: MappingError[];
}

/**
 * Язык модели в конфиге Java-супервизора (как ModelLanguage в skif_platform_supervisor)
 */
export type SupervisorModelLanguage =
  | 'JAVA'
  | 'PYTHON'
  | 'CSHARP'
  | 'CPP'
  | 'C';

/**
 * Элемент models[] в конфиге супервизора (см. backend/json/supervisor_experiment.example.json)
 */
export interface SupervisorModelRequest {
  modelId: string;
  name?: string;
  order: number;
  version?: string;
  language: SupervisorModelLanguage | string;
  modelPath: string;
  /** Текстовое описание модели в конфиге пайплайна (опционально) */
  description?: string;
  Description?: string;
  parameters?: Record<string, unknown>;
}

/**
 * Корень JSON конфига пайплайна для супервизора (experiment.start / experiment.apply)
 */
export interface SupervisorExperimentConfig {
  experimentId?: number;
  experimentName?: string;
  models: SupervisorModelRequest[];
}

/**
 * Валидированные данные куба для отображения
 */
export interface ValidatedCubeData {
  index: number;
  hash: string;
  name: string;
  cubeId: number;
  cubeType: CubeType;
  inputType: CubeIOType;
  outputType: CubeIOType;
  inputNames: string[];
  outputNames: string[];
  validatedMappings: ValidatedInputMapping[];
  hasError: boolean;
  hasDuplicateName: boolean;
  paramsName?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paramsValues?: Record<string, any>;
  /** Узел построен из models[] конфига супервизора, а не из Worker.GraphConfig.Cubes */
  supervisorModel?: SupervisorModelRequest;
}

// ============================================================================
// Результаты парсинга
// ============================================================================

/**
 * Параметры графа кубов
 */
export interface CubesGraphParams {
  nodes: GraphNode[];
  edges: GraphEdge[];
  validatedCubes?: ValidatedCubeData[];
}

// ============================================================================
// Типы для cubeConfig (additional_information)
// ============================================================================

/**
 * Информация о кубе из cubeConfig
 * Содержит CubeTypeID, Name и Hash для связывания с кубами из основного config
 */
export interface CubeConfigItem {
  /** ID базового куба (тип куба) */
  CubeTypeID: number;
  /** Имя куба (уникальный идентификатор для связи с config) */
  Name: string;
  /** Уникальный hash куба (для связи с Graph.nodes) */
  Hash: string;
  /** Имена входных портов (для dynamic типа) */
  InputNames?: string[];
}

/**
 * Позиция узла на графе
 */
export interface GraphNodePosition {
  /** Hash куба */
  hash: string;
  /** Координата X */
  x: number;
  /** Координата Y */
  y: number;
}

/**
 * Данные графа для сохранения в additional_information
 */
export interface GraphLayoutData {
  /** Позиции узлов */
  nodes?: GraphNodePosition[];
}

/**
 * Структура cubeConfig (additional_information)
 */
export interface CubeConfig {
  Cubes?: CubeConfigItem[];
  /** Данные layout графа (позиции узлов) */
  Graph?: GraphLayoutData;
}

// ============================================================================
// Типы для объединённых данных
// ============================================================================

/**
 * Маппинг входа куба (из config)
 */
export interface ConfigInputMapping {
  Type: 'CIT_RESHARDER' | 'CIT_CUBE' | 'CIT_RETRY';
  CubeName?: string;
  OutputName?: string;
}

/**
 * Куб из основного config с добавленным CubeTypeID из cubeConfig
 */
export interface MergedConfigCube {
  /** Имя куба */
  Name?: string;
  /** Произвольное описание экземпляра куба в JSON конфига (если задано) */
  Description?: string;
  description?: string;
  /** ID базового куба (из cubeConfig) */
  CubeID?: number;
  /** Имена входных портов (из config - не используется для новой логики) */
  InputNames?: string[];
  /** Имена входных портов из cubeConfig (для dynamic типа) */
  CubeConfigInputNames?: string[];
  /** Маппинги входных портов */
  InputsMapping?: Record<string, ConfigInputMapping>;
  /** Имена выходных портов */
  OutputNames?: string[];
  /** Дополнительные параметры куба */
  [key: string]: unknown;
}

/**
 * Результат объединения config и cubeConfig
 */
export interface MergedConfig {
  /** Объединённые кубы с CubeID */
  cubes: MergedConfigCube[];
  /** Оригинальный config (для других данных) */
  originalConfig: ParsedExperimentConfig;
}

// ============================================================================
// Типы для парсинга основного config
// ============================================================================

/**
 * InputSource из Resharder конфига
 */
export interface ConfigInputSource {
  SourceName?: string;
  /** Альтернативное имя для отображения (приоритет над SourceName) */
  OutputName?: string;
  [key: string]: unknown;
}

/**
 * Resharder из JSON конфига
 */
export interface ConfigResharder {
  InputSources?: ConfigInputSource[];
  [key: string]: unknown;
}

/**
 * Resources из JSON конфига
 */
export interface ConfigResources {
  Resharder?: Record<string, unknown>;
  Worker?: Record<string, unknown>;
}

/**
 * Meta.YT и Meta — как в libs/models/experiment (Cplane)
 */
export interface ConfigMetaYT {
  Token?: string;
  WorkDir?: string;
  Cluster?: string;
  ProxyRole?: string;
  TabletCellBundle?: string;
  [key: string]: unknown;
}

export interface ConfigExperimentMeta {
  ExperimentId?: string;
  ProjectId?: string;
  Namespace?: string;
  AbcProductId?: string;
  YT?: ConfigMetaYT;
  [key: string]: unknown;
}

/**
 * Куб из основного config (без CubeID)
 */
export interface ConfigCube {
  Name?: string;
  InputNames?: string[];
  InputsMapping?: Record<string, ConfigInputMapping>;
  OutputNames?: string[];
  [key: string]: unknown;
}

/**
 * GraphConfig воркера — как в internal/entities/models experiment_config (Cplane)
 */
export interface ParsedGraphConfig {
  Name?: string;
  /** В JSON часто string[]; бэкенд десериализует как []any */
  OutputNames?: unknown[];
  StateNames?: unknown[];
  Cubes?: ConfigCube[];
  [key: string]: unknown;
}

/**
 * Worker-секция конфига (GraphConfig + прочие поля вроде MaxEpochSize)
 */
export interface ParsedWorkerConfig {
  GraphConfig?: ParsedGraphConfig;
  [key: string]: unknown;
}

/**
 * Конфиг эксперимента в UI: только Meta, experimentName, models[].
 * Прочие ключи — устаревшие/ручной JSON ([key]).
 */
export interface ParsedExperimentConfig {
  Meta?: ConfigExperimentMeta;
  experimentName?: string;
  models?: unknown[];
  Placement?: Record<string, unknown>;
  Resources?: ConfigResources;
  PublicSources?: Record<string, unknown>;
  Resharder?: ConfigResharder;
  Worker?: ParsedWorkerConfig;
  States?: unknown[];
  InternalSources?: Record<string, unknown>;
  FileStorages?: unknown;
  [key: string]: unknown;
}

// ============================================================================
// Debug типы для отслеживания ошибок парсинга
// ============================================================================

/**
 * Этап парсинга конфигурации
 */
export type ParseStage =
  | 'parse_config'
  | 'parse_cube_config'
  | 'merge_configs'
  | 'validate_resharder'
  | 'validate_cubes'
  | 'validate_mappings'
  | 'dropped_mappings'
  | 'build_graph';

/**
 * Уровень важности debug сообщения
 */
export type DebugLevel = 'error' | 'warning' | 'info';

/**
 * Debug сообщение
 */
export interface DebugMessage {
  stage: ParseStage;
  level: DebugLevel;
  message: string;
  details?: unknown;
}

/**
 * Результат парсинга с debug информацией
 */
export interface ParseDebugInfo {
  messages: DebugMessage[];
  errorCount: number;
  warningCount: number;
}

/**
 * Расширенный результат парсинга графа с debug информацией
 */
export interface CubesGraphParamsWithDebug extends CubesGraphParams {
  debug: ParseDebugInfo;
}
