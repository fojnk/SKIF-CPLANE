import { sample } from 'effector';

import { ExperimentVariablesModel } from '@/modules/control-plane/entities/variables/list';
import { VariableVersionsListModel } from '@/modules/control-plane/entities/variables/versions/list';
import { VariableCreateModel } from '@/modules/control-plane/features/variable/create';
import { VariableDeleteModel } from '@/modules/control-plane/features/variable/delete';
import { VariableUpdateModel } from '@/modules/control-plane/features/variable/update';
import { SetCurrentVersionModel } from '@/modules/control-plane/features/variable/version/set-current';
import { experimentVersions } from '@/modules/control-plane/pages/project/model';

// При успешном удалении переменной удаляем из списка
sample({
  clock: VariableDeleteModel.success,
  fn: ({ params }) => params,
  target: ExperimentVariablesModel.list.removeVariable,
});

// При успешном создании переменной
sample({
  clock: VariableCreateModel.success,
  fn: ({ params }) => params.experiment_id,
  target: ExperimentVariablesModel.list.load,
});

// При успешном создании переменной перезагружаем список версий (если он загружен)
sample({
  clock: VariableCreateModel.success,
  source: VariableVersionsListModel.$data,
  filter: (data) => data !== null,
  target: VariableVersionsListModel.reload,
});

// При успешном обновлении переменной перезагружаем список версий (если он загружен)
sample({
  clock: VariableUpdateModel.success,
  source: VariableVersionsListModel.$data,
  filter: (data) => data !== null,
  target: VariableVersionsListModel.reload,
});

// При успешном удалении переменной перезагружаем список версий (если он загружен)
sample({
  clock: VariableDeleteModel.success,
  source: VariableVersionsListModel.$data,
  filter: (data) => data !== null,
  target: VariableVersionsListModel.reload,
});

sample({
  clock: VariableDeleteModel.success,
  target: experimentVersions.updates.refresh,
});

sample({
  clock: VariableUpdateModel.success,
  target: experimentVersions.updates.refresh,
});

sample({
  clock: SetCurrentVersionModel.success,
  target: experimentVersions.updates.refresh,
});
