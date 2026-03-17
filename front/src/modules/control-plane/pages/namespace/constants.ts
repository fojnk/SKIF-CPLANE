import { NamespaceTabType } from '@/modules/control-plane/shared/types';

export const NO_SCROLL_TABS: NamespaceTabType[] = ['config'];

export const NamespaceTabsOptions = [
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
