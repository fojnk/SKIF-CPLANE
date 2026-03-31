import React from 'react';

import { ErrorMessage } from '@/modules/control-plane/shared/components/sf-errors/error-message';
import { ControlPlaneError } from '@/modules/control-plane/shared/types';

interface ProjectsErrorProps {
  error: ControlPlaneError | null;
  reload?: () => void;
  pending?: boolean;
  danger?: boolean;
}

const getErrorMessage = (error: ControlPlaneError | null): string => {
  if (!error) return 'Unknown projects error';

  switch (error.status) {
    case 404:
      return 'Projects not found';
    case 403:
      return 'Access to projects denied';
    case 401:
      return 'Unauthorized access to projects';
    case 500:
      return 'Internal server error while loading projects';
    default:
      return error.message || 'Failed to load projects';
  }
};

export const ProjectsError: React.FC<ProjectsErrorProps> = ({
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
