import { useUnit } from 'effector-react';
import React from 'react';

import { namespacesPageModel } from '@/modules/stream-flow/pages/namespaces';
import { AppIcon } from '@/modules/stream-flow/shared/ui/app-icon';
import { BaseLayout } from '@/routing';
import { BaseLayoutHeaderAction } from '@/routing/ui/layouts/base/components';

export const NamespacesActions = () => {
  const onCreateClick = useUnit(namespacesPageModel.createNamespace);
  const canCreate = useUnit(namespacesPageModel.list.$canCreate);
  const actions: BaseLayoutHeaderAction[] = [];

  if (canCreate) {
    actions.push({
      action: onCreateClick,
      text: 'Новое рабочее пространство',
      view: 'action',
      icon: AppIcon.ActionAdd,
    });
  }

  return <BaseLayout.HeaderActions actions={actions} />;
};
