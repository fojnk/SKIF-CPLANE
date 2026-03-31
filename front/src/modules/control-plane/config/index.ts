import { servicesModel } from '@/modules/control-plane/entities/services';
import { registerModule } from '@/shared/lib/complex/modules';
import { ServiceIcon } from '@/shared/ui/service-icon';

import * as routes from './routes';

//const isTesting = import.meta.env.VITE_TESTING === 'true';

export const ControlPlaneModule = registerModule({
  id: 'control-plane',
  routes,
});

export const ControlPlaneService = servicesModel.registerService({
  displayName: 'Control Plane',
  name: 'control-plane',
  withRedirect: false,
  icon: ServiceIcon.ControlPlaneLogo,
  available: true,
  module: ControlPlaneModule,
  description: 'Потоковая обработка данных',
  tags: [],
});
