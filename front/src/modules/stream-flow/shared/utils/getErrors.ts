import { ControlPlaneError } from '@/modules/stream-flow/shared/types';

export const createControlPlaneError = (error: any): ControlPlaneError => ({
  status: error?.status || 0,
  statusText: error?.statusText || null,
  message: error?.message || null,
});

export const extractErrorMessage = (error: any): string | null => {
  const errorMessage =
    error && 'error' in error
      ? 'error' in error.error && typeof error.error.error === 'string'
        ? error.error.error
        : null
      : null;
  return errorMessage;
};
