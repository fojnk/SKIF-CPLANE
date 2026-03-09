import { Flex } from '@gravity-ui/uikit';
import React, { ReactNode } from 'react';

import { EditorHead } from './editor-head';

interface EditorLayoutProps {
  onSave: (disableValidation?: boolean) => void;
  children: ReactNode;
  headerAfterButtons?: React.ReactNode;
}

export const EditorLayout = ({
  onSave,
  children,
  headerAfterButtons,
}: EditorLayoutProps) => {
  return (
    <Flex direction="column" gap={0} style={{ height: '100%' }}>
      <EditorHead onSave={onSave} afterButtons={headerAfterButtons} />
      <Flex
        direction="column"
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
        }}
      >
        {children}
      </Flex>
    </Flex>
  );
};
