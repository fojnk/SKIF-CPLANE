import { servicesModel } from '@/modules/stream-flow/entities/services';
import { registerModule } from '@/shared/lib/complex/modules';
import { ServiceIcon } from '@/shared/ui/service-icon';

import * as routes from './routes';

//const isTesting = import.meta.env.VITE_TESTING === 'true';

export const SFModule = registerModule({
  id: 'stream-flow',
  routes,
});

export const SFService = servicesModel.registerService({
  displayName: 'Control Plane',
  name: 'stream-flow',
  withRedirect: false,
  icon: ServiceIcon.ControlPlaneLogo,
  available: true,
  module: SFModule,
  description: 'Потоковая обработка данных',
  tags: [],
});
