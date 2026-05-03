import { Flex, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { projectsPageModel } from '@/modules/control-plane/pages/projects';
import { ListPage, PageTitle } from '@/modules/control-plane/shared/layouts';
import {
  CatalogRadioGroup,
  catalogRadioGroupList,
} from '@/modules/control-plane/shared/ui/radio-group/catalog-radio-group';
import { GlobalLoader } from '@/shared/ui/loaders';

import {
  ProjectsPagination,
  ProjectsFilters,
  ProjectsActions,
  ProjectsError,
  ProjectsTable,
  ProjectsFiltersReset,
} from './components';

export const SFProjectsPage = () => {
  const loading = useUnit(projectsPageModel.loaders.$loading);
  const [data, failed, reload, error, filter, setFilter, total] = useUnit([
    projectsPageModel.list.$data,
    projectsPageModel.list.$failed,
    projectsPageModel.list.reload,
    projectsPageModel.list.$error,
    projectsPageModel.list.$filter,
    projectsPageModel.list.setFilter,
    projectsPageModel.list.$total,
  ]);

  if ((loading && !data) || !filter) {
    return (
      <ListPage>
        <Flex direction="row" justifyContent="space-between">
          <Flex
            direction="row"
            gap={5}
            alignItems="center"
            style={{ width: 'calc(100% - 120px)', flexWrap: 'wrap' }}
          >
            <PageTitle>Каталог</PageTitle>
            <CatalogRadioGroup active={catalogRadioGroupList.projects} />
          </Flex>
        </Flex>
        <GlobalLoader absolute />
      </ListPage>
    );
  }

  const currentPage = Math.floor(filter.offset / filter.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / filter.limit));

  return (
    <ListPage
      footer={
        <ProjectsPagination
          filter={filter}
          setFilter={setFilter}
          total={total}
        />
      }
    >
      <Flex direction="row" justifyContent="space-between">
        <Flex
          direction="row"
          gap={5}
          alignItems="center"
          style={{ width: 'calc(100% - 120px)', flexWrap: 'wrap' }}
        >
          <PageTitle>Каталог</PageTitle>
          <CatalogRadioGroup active={catalogRadioGroupList.projects} />
          {totalPages > 1 && (
            <Text variant="body-2" color="secondary" className="no-shrink">
              Страница {currentPage} из {totalPages}
            </Text>
          )}
        </Flex>
        <Flex className="no-shrink">
          <ProjectsFiltersReset filter={filter} setFilter={setFilter} />
        </Flex>
      </Flex>
      <ProjectsActions />
      <ProjectsFilters filter={filter} setFilter={setFilter} />

      {loading && <GlobalLoader absolute size="m" fadingOut />}
      {failed ? (
        <ProjectsError error={error} reload={reload} />
      ) : (
        <ProjectsTable
          data={data || []}
          filter={filter}
          setFilter={setFilter}
        />
      )}
    </ListPage>
  );
};
