import { Flex } from '@gravity-ui/uikit';
import { combine } from 'effector';
import { useUnit } from 'effector-react';
import React, { useMemo } from 'react';

import { editorPageModel } from '@/modules/control-plane/pages/editor';
import {
  EditorConfigType,
  ControlPlaneError,
} from '@/modules/control-plane/shared/types';
import { GlobalLoader } from '@/shared/ui/loaders';

import { ErrorState } from './components';
import css from './editor.module.scss';
import {
  DatasetConfig,
  DatasetSchema,
  Namespace,
  Experiment,
  Project,
} from './modules';

// Тип для модульных компонентов
type ModuleComponent =
  | typeof Project
  | typeof Namespace
  | typeof Experiment
  | typeof DatasetConfig
  | typeof DatasetSchema;

// Типы для view
type ViewConfig =
  | { component: typeof GlobalLoader; props: Record<string, never> }
  | {
      component: typeof ErrorState;
      props:
        | { type: 'error'; error: ControlPlaneError }
        | { type: 'not-found'; message?: string };
    }
  | {
      component: ModuleComponent;
      props: Record<string, never>;
    };

// Валидные типы сущностей
const VALID_ENTITY_TYPES: EditorConfigType[] = [
  'project',
  'ns',
  'ds',
  'ds2',
  'pipe',
];

// Функция для получения компонента по типу сущности
const getModuleComponent = (
  entityType: EditorConfigType | null,
): ModuleComponent | null => {
  switch (entityType) {
    case 'project':
      return Project;
    case 'ns':
      return Namespace;
    case 'pipe':
      return Experiment;
    case 'ds':
      return DatasetConfig;
    case 'ds2':
      return DatasetSchema;
    default:
      return null;
  }
};

const $view = combine(
  editorPageModel.loaders.$loading,
  editorPageModel.editor.$data,
  editorPageModel.editor.$error,
  editorPageModel.query.$queryParams,
  (loading, data, error, query): ViewConfig => {
    // Показываем загрузку
    if (loading) {
      return { component: GlobalLoader, props: {} };
    }

    // Проверяем наличие обязательных параметров query
    if (
      !query.id ||
      !query.entity ||
      !VALID_ENTITY_TYPES.includes(query.entity)
    ) {
      return {
        component: ErrorState,
        props: {
          type: 'not-found',
          message: 'Invalid required parameters',
        },
      };
    }

    // Показываем ошибку, если она есть
    if (error) {
      return {
        component: ErrorState,
        props: { type: 'error', error },
      };
    }

    // Показываем загрузку, если данных еще нет
    if (!data) {
      return { component: GlobalLoader, props: {} };
    }

    // Проверяем права на редактирование
    if (!data.canEdit) {
      return {
        component: ErrorState,
        props: {
          type: 'error',
          error: {
            status: 403,
            statusText: 'Forbidden',
            message: 'You do not have permission to edit this resource',
          },
        },
      };
    }

    // Получаем нужный модуль по типу сущности
    const ModuleComponent = getModuleComponent(query.entity);

    if (!ModuleComponent) {
      return {
        component: ErrorState,
        props: {
          type: 'not-found',
          message: `Module not found for entity type: ${query.entity}`,
        },
      };
    }

    return { component: ModuleComponent, props: {} };
  },
);

const containerStyle = { height: '100%' };

export const SFEditorPage = () => {
  const queryParams = useUnit(editorPageModel.query.$queryParams);
  const currentMode = queryParams.mode || 'code';
  const view = useUnit($view);
  const ViewComponent = view.component;

  const className = useMemo(
    () => (currentMode === 'code' ? css.editorPage : undefined),
    [currentMode],
  );

  return (
    <Flex
      direction="column"
      gap={0}
      style={containerStyle}
      className={className}
    >
      <ViewComponent {...view.props} />
    </Flex>
  );
};
