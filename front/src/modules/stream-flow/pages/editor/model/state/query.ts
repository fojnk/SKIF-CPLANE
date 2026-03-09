import { combine } from 'effector';

import { SFModule } from '@/modules/stream-flow/config';
import {
  EditorConfigType,
  EditorModeType,
} from '@/modules/stream-flow/shared/types';
import { router } from '@/routing/router';
import { querySyncModel } from '@/shared/lib/routing';

const view = SFModule.routes.editor.view;

const id = querySyncModel<string>({
  router,
  field: 'id',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const entity = querySyncModel<EditorConfigType>({
  router,
  field: 'type',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const mode = querySyncModel<EditorModeType>({
  router,
  field: 'mode',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

const $queryParams = combine({
  id: id.$value,
  entity: entity.$value,
  mode: mode.$value,
});

export { id, entity, mode, $queryParams };
