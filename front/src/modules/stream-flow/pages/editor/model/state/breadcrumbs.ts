import { createEvent, combine } from 'effector';

import {
  BreadParams,
  ProjectSelectedItem,
} from '@/modules/stream-flow/features/navigation';
import {
  EditorConfigType,
  EntityType,
} from '@/modules/stream-flow/shared/types';

import { $data } from './editor';
import { entity } from './query';

const reset = createEvent();

// Функция для конвертации EditorConfigType в EntityType
const convertEditorTypeToEntityType = (
  type: EditorConfigType | null,
): EntityType | undefined => {
  if (!type) return undefined;

  switch (type) {
    case 'project':
      return 'project';
    case 'pipe':
      return 'experiment';
    case 'ds':
      return 'dataset';
    case 'ds2':
      return 'dataset';
    case 'ns':
      return 'namespace';
    default:
      return undefined;
  }
};

// Создаем $bread через combine
const $bread = combine(
  {
    data: $data,
    entityType: entity.$value,
  },
  ({ data, entityType }): BreadParams | null => {
    if (data === null) return null;

    const convertedType = convertEditorTypeToEntityType(entityType);

    // Если это namespace, берем данные из data
    if (convertedType === 'namespace') {
      if (data.id === undefined || data.name === undefined) return null;
      return {
        id: data.id,
        name: data.name,
        type: convertedType,
      };
    }

    // Иначе берем данные из data.project
    if (
      !data.project ||
      data.project.id === undefined ||
      data.project.name === undefined
    )
      return null;
    return {
      id: data.project.id,
      name: data.project.name,
      type: convertedType,
    };
  },
);

// Создаем $selected через combine
const $selected = combine(
  {
    data: $data,
    entityType: entity.$value,
  },
  ({ data, entityType }): ProjectSelectedItem | null => {
    if (data === null) return null;

    const convertedType = convertEditorTypeToEntityType(entityType);

    // Если это не experiment или dataset, возвращаем null
    if (convertedType !== 'experiment' && convertedType !== 'dataset')
      return null;

    // Берем данные из data.id и data.name
    if (data.id === undefined || data.name === undefined) return null;

    return {
      type:
        convertedType === 'experiment'
          ? ('experiment' as const)
          : ('dataset' as const),
      id: data.id,
      name: data.name,
    };
  },
);

export { reset, $bread, $selected };
