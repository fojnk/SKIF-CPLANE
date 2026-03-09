import {
  ExperimentTabType,
  ProjectTabType,
  DatasetTabType,
} from '@/modules/stream-flow/shared/types';

export const NO_SCROLL_TABS: ProjectTabType[] = ['content', 'config'];
export const NO_SCROLL_TABS_PIPE: ExperimentTabType[] = [
  'grafana',
  'config',
  'monitoring',
];
export const NO_SCROLL_TABS_DS: DatasetTabType[] = ['config', 'schema'];

export const ProjectTabsOptions = [
  {
    id: 'content',
    title: 'Content',
  },
  {
    id: 'config',
    title: 'Config',
  },
  {
    id: 'links',
    title: 'Links',
  },
  {
    id: 'acl',
    title: 'ACL',
  },
  {
    id: 'history',
    title: 'History',
  },
] as const;

export const ExperimentTabsOptions = [
  {
    id: 'config',
    title: 'Config',
  },
  {
    id: 'ds',
    title: 'Datasets',
  },
  {
    id: 'var',
    title: 'Variables',
  },
  {
    id: 'grafana',
    title: 'Grafana',
  },
  {
    id: 'links',
    title: 'Links',
  },
  {
    id: 'acl',
    title: 'ACL',
  },
  {
    id: 'versions',
    title: 'Versions',
  },
  {
    id: 'history',
    title: 'History',
  },
  {
    id: 'jobs',
    title: 'Jobs',
  },
  {
    id: 'alerts',
    title: 'Alerts',
  },
] as const;

export const DatasetTabsOptions = [
  {
    id: 'config',
    title: 'Config',
  },
  {
    id: 'schema',
    title: 'Schema',
  },
  {
    id: 'acl',
    title: 'ACL',
  },
  {
    id: 'links',
    title: 'Experiment links',
  },
  {
    id: 'versions',
    title: 'Versions',
  },
  {
    id: 'history',
    title: 'History',
  },
  {
    id: 'jobs',
    title: 'Jobs',
  },
] as const;

export const dsAccessFilter = [
  { value: 'all', content: 'All' },
  { value: 'public', content: 'Public' },
  { value: 'private', content: 'Private' },
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
