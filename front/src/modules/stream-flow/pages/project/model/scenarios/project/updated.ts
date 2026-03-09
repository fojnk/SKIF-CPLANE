import { sample } from 'effector';

import { ProjectRenameModel } from '@/modules/stream-flow/features/project/rename';
import { ProjectUpdateModel } from '@/modules/stream-flow/features/project/update';

import { project } from '../../state';

// Обновляем название и описание проекта при успешном переименовании
sample({
  clock: ProjectRenameModel.success,
  source: project.current.$data,
  filter: Boolean,
  fn: (currentData, renameResult) => {
    if (!currentData) return currentData;
    return {
      ...currentData,
      name: renameResult.result.project?.name,
      description: renameResult.result.project?.description,
    };
  },
  target: project.current.updateData,
});

// Обновляем конфигурацию проекта при успешном обновлении
sample({
  clock: ProjectUpdateModel.success,
  source: project.current.$data,
  filter: Boolean,
  fn: (currentData, updateResult) => {
    if (!currentData) return currentData;
    return {
      ...currentData,
      config: updateResult.result.project?.config,
    };
  },
  target: project.current.updateData,
});
