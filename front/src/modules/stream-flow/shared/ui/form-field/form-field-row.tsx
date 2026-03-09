import { Flex, Text } from '@gravity-ui/uikit';
import React from 'react';

interface Props {
  label?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export const FormFieldRow = ({
  label,
  children,
  className,
  required = false,
}: Props) => {
  return (
    <Flex
      direction="column"
      className={className}
      width="100%"
      style={{ userSelect: 'none' }}
    >
      {label && (
        <Flex direction="row">
          <Text variant="caption-2" color="primary" style={{ opacity: 0.9 }}>
            {label}
          </Text>
          {required && (
            <Text variant="body-1" color="danger">
              *
            </Text>
          )}
        </Flex>
      )}
      {children}
    </Flex>
  );
};
