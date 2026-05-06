/**
 * Граф для конфига Java-супервизора (experimentName + models[]).
 * Линейная цепочка: model[i].out → model[i+1].in
 */

import {
  CubeIOType,
  CubeType,
  type CubesGraphParamsWithDebug,
  type GraphEdge,
  type GraphNode,
  type SupervisorModelLanguage,
  type SupervisorModelRequest,
  type ValidatedCubeData,
} from '../types';

import { createDebugCollector } from './debug-collector';
import {
  isSupervisorExperimentLayout,
  parseSupervisorExperimentConfig,
} from './merge-config';
import { generateHash } from './utils';

const SUPERVISOR_LANGS = new Set<SupervisorModelLanguage | string>([
  'JAVA',
  'PYTHON',
  'CSHARP',
  'CPP',
  'C',
]);

function readDatasetAlias(item: unknown): string {
  if (typeof item === 'string') {
    return item.trim();
  }
  if (item && typeof item === 'object') {
    const obj = item as Record<string, unknown>;
    const candidate =
      obj.alias ?? obj.dataset_alias ?? obj.name ?? obj.dataset ?? '';
    return typeof candidate === 'string' ? candidate.trim() : '';
  }
  return '';
}

function getDatasetAliases(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(readDatasetAlias).filter(Boolean);
}

/**
 * В сохранённом конфиге parameters обычно объект; в форме — JSON-строка (custom).
 * Без нормализации hasInputDatasets не видит input_datasets у первой модели.
 */
function normalizeSupervisorParameters(
  m: SupervisorModelRequest,
): Record<string, unknown> {
  const p: unknown = m.parameters;
  if (p && typeof p === 'object' && !Array.isArray(p)) {
    return { ...(p as Record<string, unknown>) };
  }
  if (typeof p === 'string' && p.trim() !== '') {
    try {
      const parsed = JSON.parse(p) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return {};
}

function hasInputDatasets(parameters: unknown): boolean {
  if (!parameters || typeof parameters !== 'object') {
    return false;
  }
  const raw = (parameters as Record<string, unknown>).input_datasets;
  if (!Array.isArray(raw)) {
    return false;
  }
  return raw.some((item) => readDatasetAlias(item) !== '');
}

function validateSupervisorModel(
  i: number,
  m: SupervisorModelRequest,
): string[] {
  const errs: string[] = [];
  if (!m.modelId?.trim()) {
    errs.push(`models[${i}]: modelId обязателен`);
  }
  if (m.order === undefined || m.order <= 0) {
    errs.push(`models[${i}]: order должен быть > 0`);
  }
  if (!m.language || !SUPERVISOR_LANGS.has(m.language)) {
    errs.push(
      `models[${i}]: language должен быть JAVA, PYTHON, CSHARP, CPP или C`,
    );
  }
  if (!m.modelPath?.trim()) {
    errs.push(`models[${i}]: modelPath обязателен`);
  }
  return errs;
}

function stableModelHash(index: number, modelId: string): string {
  const safe = (modelId || 'm').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `sv_${index}_${safe}`;
}

/** Вторая строка ноды графа: не CubeTypeID, а runtime / артефакт модели супервизора */
function supervisorModelSubtitle(m: SupervisorModelRequest): string | undefined {
  const parts = [m.language, m.modelPath, m.version]
    .map((x) => (x == null ? '' : String(x).trim()))
    .filter(Boolean);
  if (parts.length === 0) {
    return undefined;
  }
  return parts.join(' · ');
}

function readSupervisorModelDescription(
  m: SupervisorModelRequest,
): string | undefined {
  const raw = m.description ?? m.Description;
  if (typeof raw !== 'string') {
    return undefined;
  }
  return raw.trim() === '' ? undefined : raw;
}

type ModelWithOrderId = {
  order?: number;
  modelId?: string;
};

/**
 * Удаляет модель из массива по cubeHash ноды графа (как в buildSupervisorGraphParams),
 * перенумеровывает order в 1..n.
 */
export function removeSupervisorModelByGraphCubeHash(
  models: unknown[] | undefined | null,
  cubeHash: string,
): unknown[] {
  if (!models || !Array.isArray(models)) {
    return [];
  }
  const entries = models
    .map((model, formIndex) => ({ model, formIndex }))
    .filter(
      (e): e is { model: ModelWithOrderId; formIndex: number } =>
        e.model !== null &&
        typeof e.model === 'object' &&
        !Array.isArray(e.model),
    )
    .sort((a, b) => (a.model.order ?? 0) - (b.model.order ?? 0));
  const sortedIdx = entries.findIndex(
    (e, i) =>
      stableModelHash(i, e.model.modelId || `idx${i}`) === cubeHash,
  );
  if (sortedIdx < 0) {
    return [...models];
  }
  const formIndexToRemove = entries[sortedIdx]!.formIndex;
  const filtered = models.filter((_, i) => i !== formIndexToRemove);
  return filtered.map((m, i) => {
    if (m !== null && typeof m === 'object' && !Array.isArray(m)) {
      return { ...(m as Record<string, unknown>), order: i + 1 };
    }
    return m;
  });
}

/**
 * Строит nodes/edges/validatedCubes для конфига супервизора.
 */
export function buildSupervisorGraphParams(
  configJson: string,
): CubesGraphParamsWithDebug | null {
  const debug = createDebugCollector();

  if (!isSupervisorExperimentLayout(configJson)) {
    return null;
  }

  const parsed = parseSupervisorExperimentConfig(configJson);
  if (!parsed || !Array.isArray(parsed.models)) {
    debug.error('build_graph', 'Supervisor config: нет массива models');
    return null;
  }

  const models = [...parsed.models].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  if (models.length === 0) {
    debug.info('build_graph', 'Supervisor graph: пустой models');
    return {
      nodes: [],
      edges: [],
      validatedCubes: [],
      debug: debug.getResult(),
    };
  }

  debug.info('parse_config', 'Supervisor experiment config', {
    experimentName: parsed.experimentName,
    experimentId: parsed.experimentId,
    modelsCount: models.length,
  });

  const validatedCubes: ValidatedCubeData[] = [];
  const nodes: GraphNode[] = [];
  /** Hash порта «out» для каждой модели (для рёбер) */
  const outPortHashes: string[] = [];
  /** Hash порта «in» для каждой модели (пустая строка у первой) */
  const inPortHashes: string[] = [];

  models.forEach((m, index) => {
    const validationErrs = validateSupervisorModel(index, m);
    validationErrs.forEach((msg) =>
      debug.error('validate_cubes', msg, { modelId: m.modelId }),
    );

    const cubeHash = stableModelHash(index, m.modelId || `idx${index}`);
    const name = (m.name?.trim() || m.modelId || `model_${index}`).trim();

    const parameters = normalizeSupervisorParameters(m);
    const needInputPort = index > 0 || hasInputDatasets(parameters);
    const outputPorts = [{ name: 'out', hash: 'sv_out' }];
    const inputPorts = needInputPort ? [{ name: 'in', hash: 'sv_in' }] : [];

    outPortHashes.push(outputPorts[0]!.hash);
    inPortHashes.push(index === 0 ? '' : inputPorts[0]!.hash);

    const nodeId = `cube_${cubeHash}`;
    const baseCubeName = supervisorModelSubtitle(m);
    const modelDescription = readSupervisorModelDescription(m);
    nodes.push({
      id: nodeId,
      label: name,
      cubeHash,
      cubeId: undefined,
      baseCubeName,
      modelDescription,
      inputPorts,
      outputPorts,
      type: CubeType.CUBE,
      hasError: validationErrs.length > 0,
      errorCode: validationErrs.length > 0 ? 'error' : undefined,
    });

    validatedCubes.push({
      index,
      hash: cubeHash,
      name,
      cubeId: 0,
      cubeType: CubeType.CUBE,
      inputType: needInputPort ? CubeIOType.STATIC : CubeIOType.EMPTY,
      outputType: CubeIOType.STATIC,
      inputNames: needInputPort ? ['in'] : [],
      outputNames: ['out'],
      validatedMappings: [],
      hasError: validationErrs.length > 0,
      hasDuplicateName: false,
      paramsValues: parameters,
      supervisorModel: { ...m, parameters },
    });
  });

  const edges: GraphEdge[] = [];
  for (let i = 0; i < models.length - 1; i++) {
    const outHash = outPortHashes[i];
    const inHash = inPortHashes[i + 1];
    if (!outHash || !inHash) continue;

    const sourceId = `cube_${stableModelHash(i, models[i]!.modelId || `idx${i}`)}`;
    const targetId = `cube_${stableModelHash(i + 1, models[i + 1]!.modelId || `idx${i + 1}`)}`;

    edges.push({
      id: `edge_${generateHash(8)}`,
      source: sourceId,
      outputPortHash: outHash,
      target: targetId,
      inputPortHash: inHash,
      edgeType: 'default',
    });
  }

  const DATASET_NODE_PREFIX = 'dataset_';
  const makeDatasetNodeId = (alias: string): string =>
    `${DATASET_NODE_PREFIX}${encodeURIComponent(alias)}`;

  const inputByModelNodeId = new Map<string, string[]>();
  const outputByModelNodeId = new Map<string, string[]>();
  const aliasesFromModels = new Set<string>();

  models.forEach((m, index) => {
    const nodeId = `cube_${stableModelHash(index, m.modelId || `idx${index}`)}`;
    const params = normalizeSupervisorParameters(m);
    const inputAliases = getDatasetAliases(params.input_datasets);
    const outputAliases = getDatasetAliases(params.output_datasets);
    inputByModelNodeId.set(nodeId, inputAliases);
    outputByModelNodeId.set(nodeId, outputAliases);
    inputAliases.forEach((a) => aliasesFromModels.add(a));
    outputAliases.forEach((a) => aliasesFromModels.add(a));
  });

  const allAliases = Array.from(aliasesFromModels);

  const datasetNodes: GraphNode[] = allAliases.map((alias) => ({
    id: makeDatasetNodeId(alias),
    label: `DS: ${alias}`,
    cubeHash: `dataset_${alias}`,
    cubeId: undefined,
    baseCubeName: 'Linked dataset',
    modelDescription:
      'Dataset linked to experiment. Connect to model input/output to pass data.',
    isDataset: true,
    hasError: false,
    errorCode: undefined,
    inputPorts: [{ name: 'in', hash: `dataset_in_${alias}` }],
    outputPorts: [{ name: 'out', hash: `dataset_out_${alias}` }],
    type: CubeType.CUBE,
  }));

  const datasetEdges: GraphEdge[] = allAliases.flatMap((alias) => {
    const datasetNodeId = makeDatasetNodeId(alias);
    const inputEdges = Array.from(inputByModelNodeId.entries())
      .filter(([, aliases]) => aliases.includes(alias))
      .map(([modelNodeId]) => ({
        id: `edge_ds_in_${encodeURIComponent(alias)}_${modelNodeId}`,
        source: datasetNodeId,
        outputPortHash: `dataset_out_${alias}`,
        target: modelNodeId,
        inputPortHash: 'sv_in',
        edgeType: 'default' as const,
      }));
    const outputEdges = Array.from(outputByModelNodeId.entries())
      .filter(([, aliases]) => aliases.includes(alias))
      .map(([modelNodeId]) => ({
        id: `edge_ds_out_${modelNodeId}_${encodeURIComponent(alias)}`,
        source: modelNodeId,
        outputPortHash: 'sv_out',
        target: datasetNodeId,
        inputPortHash: `dataset_in_${alias}`,
        edgeType: 'default' as const,
      }));
    return [...inputEdges, ...outputEdges];
  });

  debug.info('build_graph', 'Supervisor graph built', {
    nodesCount: nodes.length + datasetNodes.length,
    edgesCount: edges.length + datasetEdges.length,
  });

  return {
    nodes: [...nodes, ...datasetNodes],
    edges: [...edges, ...datasetEdges],
    validatedCubes,
    debug: debug.getResult(),
  };
}
