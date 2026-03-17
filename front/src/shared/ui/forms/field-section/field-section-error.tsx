import { Text } from '@gravity-ui/uikit';
import { ReactNode } from 'react';

interface FieldSectionErrorProps {
  children?: ReactNode;
}

export const FieldSectionError = ({ children }: FieldSectionErrorProps) => (
  <Text color="danger" variant="body-1">
    {children}
  </Text>
);
