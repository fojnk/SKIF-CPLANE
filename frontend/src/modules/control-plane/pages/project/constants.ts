import {
  ExperimentTabType,
  ProjectTabType,
  DatasetTabType,
} from '@/modules/control-plane/shared/types';

export const NO_SCROLL_TABS: ProjectTabType[] = ['content', 'config'];
export const NO_SCROLL_TABS_PIPE: ExperimentTabType[] = [
  'config',
  'monitoring',
];
export const NO_SCROLL_TABS_DS: DatasetTabType[] = ['config', 'schema'];

export const ProjectTabsOptions = [
  {
    id: 'content',
    title: 'Схема',
  },
  {
    id: 'config',
    title: 'Конфигурация',
  },
  {
    id: 'acl',
    title: 'Доступ',
  },
  {
    id: 'history',
    title: 'История',
  },
] as const;

export const ExperimentTabsOptions = [
  {
    id: 'config',
    title: 'Конфигурация',
  },
  {
    id: 'ds',
    title: 'Наборы данных',
  },
  {
    id: 'var',
    title: 'Переменные',
  },
  {
    id: 'jobs',
    title: 'Запуски',
  },
  {
    id: 'acl',
    title: 'Доступ',
  },
  {
    id: 'versions',
    title: 'Версии',
  },
  {
    id: 'history',
    title: 'История',
  },
] as const;

export const DatasetTabsOptions = [
  {
    id: 'config',
    title: 'Конфигурация',
  },
  {
    id: 'schema',
    title: 'Схема',
  },
  {
    id: 'acl',
    title: 'Доступ',
  },
  {
    id: 'links',
    title: 'Ссылки на эксперименты',
  },
  {
    id: 'versions',
    title: 'Версии',
  },
  {
    id: 'history',
    title: 'История',
  },
] as const;

export const dsAccessFilter = [
  { value: 'all', content: 'Все' },
  { value: 'public', content: 'Публичные' },
  { value: 'private', content: 'Приватные' },
];

export const severity = {
  info: 'Info',
  warning: 'Warning',
  critical: 'Critical',
  disaster: 'Disaster',
};

export const enum severityStatusNames {
  info = 'info',
  infoCaps = 'Info',
  warning = 'warning',
  warningCaps = 'Warning',
  critical = 'critical',
  criticalCaps = 'Critical',
  disaster = 'disaster',
  disasterCaps = 'Disaster',
}
