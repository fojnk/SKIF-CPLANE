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
import { createPortsWithHash, generateHash } from './utils';

const SUPERVISOR_LANGS = new Set<SupervisorModelLanguage | string>([
  'JAVA',
  'PYTHON',
  'CSHARP',
  'CPP',
  'C',
]);

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

    const outputPorts = createPortsWithHash(['out']);
    const inputPorts =
      index === 0 ? [] : createPortsWithHash(['in']);

    outPortHashes.push(outputPorts[0]!.hash);
    inPortHashes.push(index === 0 ? '' : inputPorts[0]!.hash);

    const nodeId = `cube_${cubeHash}`;
    nodes.push({
      id: nodeId,
      label: name,
      cubeHash,
      cubeId: undefined,
      baseCubeName: undefined,
      inputPorts,
      outputPorts,
      type: CubeType.CUBE,
      hasError: validationErrs.length > 0,
      errorCode: validationErrs.length > 0 ? 'error' : undefined,
    });

    const parameters = m.parameters ?? {};

    validatedCubes.push({
      index,
      hash: cubeHash,
      name,
      cubeId: 0,
      cubeType: CubeType.CUBE,
      inputType: index === 0 ? CubeIOType.EMPTY : CubeIOType.STATIC,
      outputType: CubeIOType.STATIC,
      inputNames: index === 0 ? [] : ['in'],
      outputNames: ['out'],
      validatedMappings: [],
      hasError: validationErrs.length > 0,
      hasDuplicateName: false,
      paramsValues:
        parameters && typeof parameters === 'object'
          ? (parameters as Record<string, unknown>)
          : {},
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

  debug.info('build_graph', 'Supervisor graph built', {
    nodesCount: nodes.length,
    edgesCount: edges.length,
  });

  return {
    nodes,
    edges,
    validatedCubes,
    debug: debug.getResult(),
  };
}
