import React from 'react';

import { ControlPlaneError } from '@/modules/control-plane/shared/types';

import { ErrorMessage } from './error-message';

interface NamespaceErrorProps {
  error: ControlPlaneError | null;
  reload?: () => void;
  pending?: boolean;
  danger?: boolean;
}

const getErrorMessage = (error: ControlPlaneError | null): string => {
  if (!error) return 'Unknown workspace error';

  switch (error.status) {
    case 404:
      return 'Workspace not found';
    case 403:
      return 'Access to workspace denied';
    case 401:
      return 'Unauthorized access to workspace';
    case 500:
      return 'Internal server error while loading workspace';
    default:
      return error.message || 'Failed to load workspace';
  }
};

export const NamespaceError: React.FC<NamespaceErrorProps> = ({
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
