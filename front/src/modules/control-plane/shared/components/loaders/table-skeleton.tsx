import { Flex, Skeleton } from '@gravity-ui/uikit';
import React from 'react';

interface TableSkeletonProps {
  lines?: number;
  height?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  lines = 3,
  height = 40,
}) => {
  return (
    <Flex direction="column" gap={1}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton key={idx} style={{ width: '100%', height, opacity: '0.5' }} />
      ))}
    </Flex>
  );
};
