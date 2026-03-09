import { NamespaceTabType } from '@/modules/control-plane/shared/types';

export const NO_SCROLL_TABS: NamespaceTabType[] = ['config'];

export const NamespaceTabsOptions = [
  {
    id: 'config',
    title: 'Config',
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
