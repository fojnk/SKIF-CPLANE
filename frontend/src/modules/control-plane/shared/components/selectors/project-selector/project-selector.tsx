import { Flex, Pagination } from '@gravity-ui/uikit';
import React, { useEffect, useState } from 'react';

import { ProjectSelectorTable } from '@/modules/control-plane/shared/components';
import { ErrorMessage } from '@/modules/control-plane/shared/components/sf-errors';
import {
  ProjectCatalog,
  PaginationData,
  ControlPlaneError,
  SearchProjectRequest,
} from '@/modules/control-plane/shared/types';
import { SearchInput } from '@/modules/control-plane/shared/ui';
import { getFromStorage, setToStorage } from '@/shared/lib/common/storage';
import { GlobalLoader } from '@/shared/ui/loaders';

interface ProjectSelectorProps {
  onRowClick: (project: ProjectCatalog) => void;
  loading?: boolean;
  data?: ProjectCatalog[] | null;
  total?: number;
  error?: ControlPlaneError;
  load: (request: SearchProjectRequest) => void;
  reset: () => void;
}

export const ProjectSelector = ({
  onRowClick,
  loading = false,
  data = null,
  total = 0,
  error,
  reset,
  load,
}: ProjectSelectorProps) => {
  const [pageData, setPageData] = useState<PaginationData>({
    page: 1,
    pageSize: 15,
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    const savedPageSize = getFromStorage<number>({
      type: 'local',
      key: 'select-project-modal-page-size',
    });

    const initialPageData = savedPageSize
      ? { page: 1, pageSize: savedPageSize }
      : { page: 1, pageSize: 15 };

    setPageData(initialPageData);

    load({
      limit: initialPageData.pageSize,
      offset: (initialPageData.page - 1) * initialPageData.pageSize,
    });
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !data) {
    return <GlobalLoader absolute size="m" />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error?.message || 'Error loading projects list'}
        reload={() =>
          load({
            limit: pageData.pageSize,
            offset: (pageData.page - 1) * pageData.pageSize,
            search: search || undefined,
          })
        }
        pending={loading}
      />
    );
  }

  const handleUpdatePage = (page: number, pageSize: number) => {
    setToStorage({
      type: 'local',
      key: 'select-project-modal-page-size',
      value: pageSize,
    });

    const newPageData = {
      ...pageData,
      page,
      pageSize,
    };

    setPageData(newPageData);

    load({
      limit: newPageData.pageSize,
      offset: (newPageData.page - 1) * newPageData.pageSize,
      search: search || undefined,
    });
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);

    load({
      limit: pageData.pageSize,
      offset: (pageData.page - 1) * pageData.pageSize,
      search: newSearch || undefined,
    });
  };

  return (
    <Flex direction="column" style={{ height: '100%', minHeight: 0 }} gap={2}>
      <Flex direction="column" style={{ flexShrink: 0 }}>
        <SearchInput search={search} setSearch={handleSearchChange} />
      </Flex>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {loading && (
          <GlobalLoader absolute size="m" fadingOut style={{ zIndex: 2 }} />
        )}
        <ProjectSelectorTable data={data || []} onRowClick={onRowClick} />
      </div>
      <Flex direction="row" justifyContent="center" style={{ flexShrink: 0 }}>
        <Pagination
          total={error ? 0 : total}
          page={pageData.page}
          pageSize={pageData.pageSize}
          pageSizeOptions={[10, 15, 20, 50, 100]}
          onUpdate={handleUpdatePage}
        />
      </Flex>
    </Flex>
  );
};
