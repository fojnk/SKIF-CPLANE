import { Button } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { SFModule } from '@/modules/stream-flow/config';
import { namespacePageModel } from '@/modules/stream-flow/pages/namespace';
import { ErrorCard } from '@/modules/stream-flow/shared/components/sf-errors';
import { SFLayoutMain } from '@/modules/stream-flow/shared/layout';
import { GlobalLoader } from '@/shared/ui/loaders';

import { NamespaceTabs, NamespaceHeader } from './components';

export const SFNamespacePage = () => {
  const [namespace, loading, failed, error] = useUnit([
    namespacePageModel.namespace.$data,
    namespacePageModel.namespace.$loading,
    namespacePageModel.namespace.$failed,
    namespacePageModel.namespace.$error,
  ]);

  const handleBackToList = () => {
    SFModule.routes.namespaces.navigate.prepend(() => ({
      replace: false,
      params: {},
      query: {},
    }))();
  };

  const backToListButton = (
    <Button view="outlined" onClick={handleBackToList}>
      Back to Workspaces List
    </Button>
  );

  // Показываем лоадер во время загрузки
  if (loading) {
    return (
      <SFLayoutMain>
        <GlobalLoader />
      </SFLayoutMain>
    );
  }

  // Показываем ошибку если загрузка не удалась
  if (failed) {
    const errorCode = error?.status || 500;

    if (errorCode === 404) {
      return (
        <SFLayoutMain>
          <ErrorCard
            title="Workspace Not Found"
            message="The requested workspace could not be found. It may have been deleted or you may not have access to it."
            button={backToListButton}
          />
        </SFLayoutMain>
      );
    }

    if (errorCode === 403) {
      return (
        <SFLayoutMain>
          <ErrorCard
            title="Access Denied"
            message="You don't have permission to access this workspace. Please contact your administrator for access."
            button={backToListButton}
          />
        </SFLayoutMain>
      );
    }

    // Общая ошибка для других кодов
    return (
      <SFLayoutMain>
        <ErrorCard
          title="Error Loading Workspace"
          message={`Failed to load workspace. Error code: ${errorCode}`}
          button={backToListButton}
        />
      </SFLayoutMain>
    );
  }

  // Если нет данных, но нет ошибки - показываем пустое состояние
  if (!namespace) {
    return (
      <SFLayoutMain>
        <ErrorCard
          title="No Data Available"
          message="No workspace information is available."
          button={backToListButton}
        />
      </SFLayoutMain>
    );
  }

  return (
    <SFLayoutMain>
      <NamespaceHeader namespace={namespace} />
      <NamespaceTabs namespace={namespace} />
    </SFLayoutMain>
  );
};
