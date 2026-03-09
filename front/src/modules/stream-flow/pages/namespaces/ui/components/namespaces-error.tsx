import React from 'react';

import { ErrorMessage } from '@/modules/stream-flow/shared/components/sf-errors/error-message';
import { ControlPlaneError } from '@/modules/stream-flow/shared/types';

interface NamespacesErrorProps {
  error: ControlPlaneError | null;
  reload?: () => void;
  pending?: boolean;
  danger?: boolean;
}

const getErrorMessage = (error: ControlPlaneError | null): string => {
  if (!error) return 'Unknown workspaces error';

  switch (error.status) {
    case 404:
      return 'Workspaces not found. Please select an existing workspace from the list.';
    case 403:
      return 'Access to workspaces denied';
    case 401:
      return 'Unauthorized access to workspaces';
    case 500:
      return 'Internal server error while loading workspaces';
    default:
      return error.message || 'Failed to load workspaces';
  }
};

export const NamespacesError: React.FC<NamespacesErrorProps> = ({
  error,
  reload,
  pending = false,
  danger = true,
}) => {
  return (
    <ErrorMessage
      message={getErrorMessage(error)}
      reload={error!.status === 500 ? reload : undefined}
      pending={pending}
      danger={danger}
    />
  );
};
