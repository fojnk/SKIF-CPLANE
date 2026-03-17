import { createEvent, createStore, sample } from 'effector';

import { ExperimentVariableModel } from '@/modules/control-plane/entities/variables/single';
import { VariableVersionModel } from '@/modules/control-plane/entities/variables/versions/single';
import { VariableUpdateModel } from '@/modules/control-plane/features/variable/update';
import { SetCurrentVersionModel } from '@/modules/control-plane/features/variable/version/set-current';
import { formatData } from '@/modules/control-plane/shared/utils/formatData';
import { createLocalEvent } from '@/shared/lib/effector/create-local-event';
import { modalsModel } from '@/shared/ui/modals';

import { VariableShowPayload, VariableVersionMode } from './types';

const modal = modalsModel.register<VariableShowPayload>({
  view: async () => (await import('./ui')).Modal,
});

// Единый event для сброса всех данных
const reset = createEvent();

// Управление режимом просмотра/редактирования/восстановления/сравнения
const $mode = createStore<VariableVersionMode>('view').reset(reset);
const setMode = createEvent<VariableVersionMode>();

sample({
  clock: setMode,
  target: $mode,
});

// Управление значениями для редактирования
const $editedValue = createStore<string>('').reset(reset);
const $initialValue = createStore<string>('').reset(reset);
const setEditedValue = createEvent<string>();

sample({
  clock: setEditedValue,
  target: $editedValue,
});

// Store для хранения типа переменной
const $variableType = createStore<string>('').reset(reset);
// Store для хранения номера версии
const $versionIdName = createStore<number | null>(null).reset(reset);

const start = createLocalEvent<VariableShowPayload>((event) => {
  // Сохраняем тип переменной
  sample({
    clock: event,
    fn: (payload) => payload.item.type,
    target: $variableType,
  });

  // Сохраняем номер версии
  sample({
    clock: event,
    fn: (payload) => payload.item.version_id_name!,
    target: $versionIdName,
  });

  // Устанавливаем режим из payload
  sample({
    clock: event,
    fn: (payload) => payload.mode,
    target: $mode,
  });

  // Загружаем данные версии
  sample({
    clock: event,
    fn: (payload) => payload.item.version_id!,
    target: VariableVersionModel.load,
  });

  // Загружаем head версию для режима compare через ExperimentVariableModel
  sample({
    clock: event,
    filter: (payload) => payload.mode === 'compare' && !payload.head,
    fn: (payload) => payload.item.id,
    target: ExperimentVariableModel.variable.load,
  });

  // Открываем модалку
  sample({
    clock: event,
    target: modal.open,
  });
});

// Инициализируем значения после загрузки данных версии с форматированием для JSON
sample({
  clock: VariableVersionModel.success,
  source: $variableType,
  fn: (type, { result }) => {
    const value = result?.value || '';
    if (type === 'json' && value) {
      return formatData(value);
    }
    return value;
  },
  target: [$editedValue, $initialValue],
});

// Переход в режим редактирования (значение уже отформатировано)
const startEdit = createEvent();

sample({
  clock: startEdit,
  fn: () => 'edit' as const,
  target: $mode,
});

// Отмена редактирования
const cancelEdit = createEvent();

sample({
  clock: cancelEdit,
  source: $initialValue,
  target: $editedValue,
});

sample({
  clock: cancelEdit,
  fn: () => 'view' as const,
  target: $mode,
});

// После успешного обновления переводим в режим просмотра и обновляем initialValue
sample({
  clock: VariableUpdateModel.success,
  fn: () => 'view' as const,
  target: $mode,
});

sample({
  clock: VariableUpdateModel.success,
  source: $editedValue,
  target: $initialValue,
});

// Обновляем номер версии после успешного обновления
sample({
  clock: VariableUpdateModel.success,
  fn: ({ result }) => result?.variable?.version_id_name ?? null,
  target: $versionIdName,
});

// Закрываем модалку после успешного restore
sample({
  clock: SetCurrentVersionModel.success,
  target: modal.close,
});

// Загрузка head версии при переключении в режим compare
sample({
  clock: setMode,
  source: modal.$payload,
  filter: (payload, mode) =>
    mode === 'compare' && payload !== null && !payload.head,
  fn: (payload) => payload!.item.id,
  target: ExperimentVariableModel.variable.load,
});

// Сброс при закрытии модалки
sample({
  clock: modal.closed,
  target: [
    VariableVersionModel.reset,
    ExperimentVariableModel.variable.reset,
    reset,
  ],
});

export {
  start,
  $mode,
  setMode,
  $editedValue,
  $initialValue,
  $versionIdName,
  setEditedValue,
  startEdit,
  cancelEdit,
};
