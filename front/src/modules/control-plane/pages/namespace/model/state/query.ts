import { ControlPlaneModule } from '@/modules/control-plane/config';
import { router } from '@/routing/router';
import { querySyncModel } from '@/shared/lib/routing';

const view = ControlPlaneModule.routes.namespace.view;

const namespace = querySyncModel<string | null>({
  router,
  field: 'id',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

export { namespace };
