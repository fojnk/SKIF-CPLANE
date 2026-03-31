import { sample } from 'effector';

import { ControlPlaneModule } from '@/modules/control-plane/config';
import { ProjectDeleteModel } from '@/modules/control-plane/features/project/delete';

// При успешном удалении проекта переходим к списку проектов
sample({
  clock: ProjectDeleteModel.success,
  filter: ControlPlaneModule.routes.project.view.$mounted,
  fn: () => {
    return { replace: false, params: {}, query: {} };
  },
  target: ControlPlaneModule.routes.root.navigate,
});
