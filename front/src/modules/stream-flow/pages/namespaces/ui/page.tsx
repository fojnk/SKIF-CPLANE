import { Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { namespacesPageModel } from '@/modules/stream-flow/pages/namespaces';
import { ListPage, PageTitle } from '@/modules/stream-flow/shared/layouts';
import {
  CatalogRadioGroup,
  catalogRadioGroupList,
} from '@/modules/stream-flow/shared/ui/radio-group/catalog-radio-group';
import { GlobalLoader } from '@/shared/ui/loaders';

import {
  NamespacesFilters,
  NamespacesActions,
  NamespacesTable,
  NamespacesError,
} from './components';

export const SFNamespacesPage = () => {
  const [loading, data, failed, error, load, search] = useUnit([
    namespacesPageModel.list.$loading,
    namespacesPageModel.list.$data,
    namespacesPageModel.list.$failed,
    namespacesPageModel.list.$error,
    namespacesPageModel.list.load,
    namespacesPageModel.list.$search,
  ]);

  if (loading && !data) {
    return (
      <ListPage>
        <NamespacesActions />
        <Flex gap={4} alignItems="center">
          <PageTitle>Catalog</PageTitle>
          <CatalogRadioGroup active={catalogRadioGroupList.namespaces} />
        </Flex>
        <GlobalLoader absolute />
      </ListPage>
    );
  }

  return (
    <ListPage>
      <NamespacesActions />
      <Flex gap={4} alignItems="center">
        <PageTitle>Catalog</PageTitle>
        <CatalogRadioGroup active={catalogRadioGroupList.namespaces} />
      </Flex>
      <NamespacesFilters />
      {loading && <GlobalLoader absolute size="m" fadingOut />}
      {failed ? (
        <NamespacesError error={error} reload={load} />
      ) : (
        <NamespacesTable data={data || []} search={search} />
      )}
    </ListPage>
  );
};
