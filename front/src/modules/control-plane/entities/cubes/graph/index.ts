/**
 * Утилиты для работы с графом кубов
 */

// ============================================================================
// Утилиты
// ============================================================================
export {
  generateHash,
  generateUniqueHash,
  createPortsWithHash,
  cleanParams,
  createExperimentCube,
  convertCubesToFormFormat,
} from './utils';

// ============================================================================
// Парсинг cubeConfig
// ============================================================================
export {
  parseCubeConfig,
  createCubeTypeIdMap,
  createNodePositionsMap,
  getCubeTypeId,
  getCubeConfigItems,
  getGraphLayoutData,
  getGraphNodePositions,
} from './parse-cube-config';

// ============================================================================
// Объединение конфигов
// ============================================================================
export {
  parseExperimentConfig,
  mergeConfigs,
  hasResharderResources,
  getResharderInputSources,
} from './merge-config';

// ============================================================================
// Парсинг графа (для режима просмотра)
// ============================================================================
export { parseGraphConfig } from './parse-graph';

// ============================================================================
// Валидация портов
// ============================================================================
export {
  validateOutputNames,
  validateInputNames,
  getInputPortsInfo,
  getOutputPortsInfo,
  type ValidatedOutputNames,
  type ValidatedInputNames,
} from './validate-ports';

// ============================================================================
// Построение графа (для режима редактирования)
// ============================================================================
export {
  buildGraphFromCubes,
  isExternalNode,
  getIncomingEdges,
  getOutgoingEdges,
  findExternalSources,
  type BuildGraphOptions,
} from './build-graph';

// ============================================================================
// Layout графа
// ============================================================================
export { layoutGraph, dagreLayout, simpleLayout } from './layout';

// ============================================================================
// Построение cubeConfig из формы
// ============================================================================
export {
  buildCubeConfig,
  buildCubeConfigJson,
  buildFullCubeConfig,
  buildFullCubeConfigJson,
  buildFullCubeConfigWithPositions,
  buildFullCubeConfigJsonWithPositions,
  createCubeConfigItem,
  extractGraphLayout,
  stringifyCubeConfig,
  type EditFormCube,
} from './cube-config-builder';

// ============================================================================
// Debug утилиты
// ============================================================================
export {
  DebugCollector,
  createDebugCollector,
  createEmptyDebugInfo,
} from './debug-collector';
