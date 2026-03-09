import React from 'react';

import { ErrorMessage } from '@/modules/stream-flow/shared/components/sf-errors';
import { ControlPlaneError } from '@/modules/stream-flow/shared/types';

interface DatasetsErrorProps {
  error: ControlPlaneError | null;
  reload?: () => void;
  pending?: boolean;
  danger?: boolean;
}

const getErrorMessage = (error: ControlPlaneError | null): string => {
  if (!error) return 'Unknown datasets error';

  switch (error.status) {
    case 404:
      return 'Datasets not found';
    case 403:
      return 'Access to datasets denied';
    case 401:
      return 'Unauthorized access to datasets';
    case 500:
      return 'Internal server error while loading datasets';
    default:
      return error.message || 'Failed to load datasets';
  }
};

export const DatasetsError: React.FC<DatasetsErrorProps> = ({
  error,
  reload,
  pending = false,
  danger = true,
}) => {
  return (
    <ErrorMessage
      message={getErrorMessage(error)}
      reload={reload}
      pending={pending}
      danger={danger}
    />
  );
};
