import { sample } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import { ProjectDeleteModel } from '@/modules/stream-flow/features/project/delete';

// При успешном удалении проекта переходим к списку проектов
sample({
  clock: ProjectDeleteModel.success,
  filter: SFModule.routes.project.view.$mounted,
  fn: () => {
    return { replace: false, params: {}, query: {} };
  },
  target: SFModule.routes.root.navigate,
});
