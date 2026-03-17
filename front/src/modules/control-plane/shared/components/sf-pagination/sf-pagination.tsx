import { Flex, Pagination } from '@gravity-ui/uikit';
import React from 'react';

import { PaginationData } from '@/modules/control-plane/shared/types';

interface CatalogPaginationProps {
  total: number;
  pageData: PaginationData;
  onUpdatePage: (page: number, pageSize: number) => void;
  pageSizeOptions?: number[];
}

export const SFPagination = ({
  total,
  pageData,
  onUpdatePage,
  pageSizeOptions = [10, 15, 20, 50, 100],
}: CatalogPaginationProps) => {
  return (
    <Flex direction="row" justifyContent="center">
      <Pagination
        total={total}
        page={pageData.page}
        pageSize={pageData.pageSize}
        pageSizeOptions={pageSizeOptions}
        onUpdate={onUpdatePage}
      />
    </Flex>
  );
};
