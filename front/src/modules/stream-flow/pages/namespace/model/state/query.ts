import { SFModule } from '@/modules/stream-flow/config';
import { router } from '@/routing/router';
import { querySyncModel } from '@/shared/lib/routing';

const view = SFModule.routes.namespace.view;

const namespace = querySyncModel<string | null>({
  router,
  field: 'id',
  method: 'replace',
  preset: 'string',
  enabled: view.$mounted,
});

export { namespace };
