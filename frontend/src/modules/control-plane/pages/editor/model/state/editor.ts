import { combine, createEvent, createStore, sample } from 'effector';

import type { GraphNodePosition } from '@/modules/control-plane/entities/cubes';
import {
  EditorDataDC,
  ControlPlaneError,
} from '@/modules/control-plane/shared/types';

const reset = createEvent();

const updateConfig = createEvent<string>();
const updateCubeConfig = createEvent<string>();
const $data = createStore<EditorDataDC | null>(null).reset(reset);
const $error = createStore<ControlPlaneError | null>(null).reset(reset);

// Текущий конфиг для редактирования (синхронизируется с Monaco и формой)
const setCurrentConfig = createEvent<string>();
const setValidatedConfig = createEvent<string | null>();
const $currentConfig = createStore<string>('').reset(reset);
const $validatedConfig = createStore<string | null>(null).reset(reset);
const $valid = createStore<boolean>(false).reset(reset);

// cubeConfig (additional_information) - хранит CubeTypeID и InputNames
const setCurrentCubeConfig = createEvent<string>();
const $currentCubeConfig = createStore<string>('').reset(reset);

// Начальный cubeConfig (сохраняется при загрузке и не меняется)
const setInitialCubeConfig = createEvent<string>();
const $initialCubeConfig = createStore<string>('').reset(reset);

sample({
  clock: setInitialCubeConfig,
  target: $initialCubeConfig,
});

// Позиции узлов графа (для сохранения в additional_information)
const setGraphNodePositions = createEvent<GraphNodePosition[]>();
const $graphNodePositions = createStore<GraphNodePosition[]>([]).reset(reset);

sample({
  clock: setGraphNodePositions,
  target: $graphNodePositions,
});

// Конфиг из формы (для режима form)
const setForm = createEvent<string>();
const $form = createStore<string>('').reset(reset);

sample({
  clock: setValidatedConfig,
  target: $validatedConfig,
});

sample({
  clock: setCurrentConfig,
  target: $currentConfig,
});

sample({
  clock: setForm,
  target: $form,
});

sample({
  clock: setCurrentCubeConfig,
  target: $currentCubeConfig,
});

sample({
  clock: updateConfig,
  source: $data,
  fn: (data, newConfig) => (data ? { ...data, config: newConfig } : null),
  target: $data,
});

sample({
  clock: updateCubeConfig,
  source: $data,
  fn: (data, newCubeConfig) =>
    data ? { ...data, additional_information: newCubeConfig } : null,
  target: $data,
});

// Вычисляемый стор с информацией о состоянии редактора
const $info = combine(
  {
    currentConfig: $currentConfig,
    data: $data,
    validatedConfig: $validatedConfig,
    valid: $valid,
  },
  ({ currentConfig, data, validatedConfig, valid }) => {
    // Проверяем валидность JSON
    let invalidJson = false;
    if (currentConfig) {
      try {
        JSON.parse(currentConfig);
      } catch {
        invalidJson = true;
      }
    }
    const dataConfig = data?.config ?? '';

    return {
      invalidJson,
      changed: currentConfig !== dataConfig,
      validated: valid && validatedConfig === currentConfig,
    };
  },
);

export {
  reset,
  updateConfig,
  updateCubeConfig,
  $currentConfig,
  setCurrentConfig,
  $currentCubeConfig,
  setCurrentCubeConfig,
  $initialCubeConfig,
  setInitialCubeConfig,
  $graphNodePositions,
  setGraphNodePositions,
  $data,
  $error,
  $validatedConfig,
  setValidatedConfig,
  $valid,
  $info,
  $form,
  setForm,
};
