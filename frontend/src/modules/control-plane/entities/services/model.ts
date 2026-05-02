import { createValueModel } from '@/shared/lib/effector/value-model';

import { ServiceInfo } from './types';

const services = createValueModel<ServiceInfo>([], { type: 'list' });

export const $services = services.$value;

export const registerService = (service: ServiceInfo) => {
  services.add(service);

  return service;
};
