import { FileCode } from '@gravity-ui/icons';

import { createValueModel } from '@/shared/lib/effector/value-model';
import { ServiceIcon } from '@/shared/ui/service-icon';

import { ServiceInfo } from './types';

//const isTesting = import.meta.env.VITE_TESTING === 'true';

const services = createValueModel<ServiceInfo>(
  [
    {
      name: 'ABC',
      withRedirect: true,
      icon: ServiceIcon.AbcLogo,
      available: true,
      description: 'Управление квотами и продуктами',
      externalHref: 'https://one.vk.team/abc/',
    },
    {
      name: 'MDB',
      withRedirect: true,
      icon: ServiceIcon.MdbLogo,
      available: true,
      description: 'Управление базами данных',
      externalHref: 'https://one.vk.team/mdb/',
    },
    {
      name: 'S3',
      withRedirect: true,
      icon: ServiceIcon.S3Logo,
      description: 'Управление S3',
      available: true,
      externalHref: 'https://one.vk.team/s3/',
    },
    {
      name: 'Artifactory',
      withRedirect: true,
      icon: ServiceIcon.ArtifactoryLogo,
      description: 'Работа с ресурсами',
      available: true,
      externalHref: 'https://artifactory.vk.team',
    },
    {
      name: 'OneFlow',
      icon: ServiceIcon.OneFlowLogo,
      available: true,
      description: 'Работа с DAGами',
      externalHref: `https://one-flow.vk.team`,
    },
    {
      name: 'code-search',
      icon: FileCode,
      available: true,
      description: 'Поиск по репозиториям',
      externalHref: 'https://cs.vk.team/search/',
    },
    {
      name: 'Docs',
      withRedirect: true,
      icon: ServiceIcon.DocsLogo,
      available: true,
      description: 'База знаний по внутренним сервисам VK',
      externalHref: 'https://docs.vk.team/',
    },
    {
      name: 'Warp',
      withRedirect: true,
      icon: ServiceIcon.WarpLogo,
      available: true,
      description: '',
      externalHref: `https://warp.vk.team/`,
    },
    {
      name: 'OneSecret',
      withRedirect: true,
      icon: ServiceIcon.OneSecretLogo,
      available: true,
      description: 'Управление секретами',
      externalHref: `https://one-secret.vk.team/`,
    },
    {
      name: 'Inference Platform',
      withRedirect: true,
      icon: ServiceIcon.InferenceLogo,
      available: true,
      description: 'Хостинг, публикация и управление ML-моделями',
      externalHref: `https://inference.vk.team/`,
    },
    {
      name: 'PMS',
      withRedirect: true,
      icon: ServiceIcon.PmsLogo,
      available: true,
      description: 'Управление конфигурациями',
      externalHref: `https://one.vk.team/oneconf/`,
    },
    {
      name: 'Mops',
      withRedirect: true,
      icon: ServiceIcon.MopsLogo,
      available: true,
      description: 'Запуск ноутбуков в облаке',
      externalHref: `https://oneui.vk.team/mops`,
    },
  ],
  { type: 'list' },
);

const servicesOrderMap: Record<string, number> = {
  ABC: 10,
  Artifactory: 20,
  'boost-hub': 30,
  'code-search': 40,
  'discovery-ai-demo': 50,
  Docs: 60,
  'dq-tools': 70,
  'feature-flow': 80,
  'Inference Platform': 90,
  'labeling-platform': 100,
  MDB: 110,
  'model-store': 120,
  Mops: 130,
  OneFlow: 140,
  OneSecret: 150,
  PMS: 160,
  recolens: 170,
  S3: 180,
  'ss-etl': 190,
  'control-plane': 200,
  'ucp-models': 210,
  Warp: 220,
};

const $servicesWithoutOrder = services.$value;

export const $services = $servicesWithoutOrder.map((services) =>
  [...services].sort((a, b) => {
    const aIdx = servicesOrderMap[a.name]
      ? servicesOrderMap[a.name]!
      : Number.POSITIVE_INFINITY;
    const bIdx = servicesOrderMap[b.name]
      ? servicesOrderMap[b.name]!
      : Number.POSITIVE_INFINITY;
    return aIdx - bIdx;
  }),
);

export const registerService = (service: ServiceInfo) => {
  services.add(service);

  return service;
};
