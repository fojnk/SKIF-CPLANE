import { Button, Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

import { navigationModel } from '@/modules/control-plane/features/navigation';
import { ControlPlaneError } from '@/modules/control-plane/shared/types';

type ErrorStateProps =
  | {
      type: 'error';
      error: ControlPlaneError;
    }
  | {
      type: 'not-found';
      message?: string;
    };

export const ErrorState: React.FC<ErrorStateProps> = (props) => {
  const isError = props.type === 'error';
  const title = isError
    ? props.error.status
      ? String(props.error.status)
      : 'Error'
    : '404';
  const message = isError
    ? props.error.message || props.error.statusText || 'An error occurred'
    : props.message || 'Page not found';

  const handleGoHome = () => {
    navigationModel.projects.navigate();
  };

  return (
    <Flex
      direction="column"
      gap={3}
      alignItems="center"
      justifyContent="center"
      style={{ height: '100%', padding: '40px' }}
    >
      <Text variant="display-1" color="danger">
        {title}
      </Text>
      <Text variant="subheader-3">{message}</Text>
      {!isError && (
        <Text variant="body-1">
          The requested resource could not be found or is invalid.
        </Text>
      )}
      {isError && (
        <Button view="action" size="l" onClick={handleGoHome}>
          Return to home
        </Button>
      )}
    </Flex>
  );
};
