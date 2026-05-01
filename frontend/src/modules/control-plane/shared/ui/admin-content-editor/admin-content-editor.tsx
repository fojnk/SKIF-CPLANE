import { Button, Flex, Loader, Text } from '@gravity-ui/uikit';
import { ReactNode } from 'react';

import { ListPage, PageTitle } from '@/modules/control-plane/shared/layouts';

interface AdminContentEditorProps {
  title: string;
  loading: boolean;
  isAdmin: boolean;
  onReload: () => void;
  onEdit?: () => void;
  editButtonText?: string;
  children: ReactNode;
}

export const AdminContentEditor = ({
  title,
  loading,
  isAdmin,
  onReload,
  onEdit,
  editButtonText = 'Редактировать',
  children,
}: AdminContentEditorProps) => {
  return (
    <ListPage>
      <Flex direction="column" gap={4}>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex direction="column" gap={1}>
            <PageTitle>{title}</PageTitle>
            {isAdmin && (
              <Text variant="body-2" color="warning">
                Режим редактирования (admin/root)
              </Text>
            )}
          </Flex>
          <Flex gap={2}>
            <Button view="outlined" onClick={onReload} disabled={loading}>
              Обновить
            </Button>
            {isAdmin && onEdit && (
              <Button view="action" onClick={onEdit}>
                {editButtonText}
              </Button>
            )}
          </Flex>
        </Flex>
        {loading ? (
          <Flex justifyContent="center">
            <Loader size="l" />
          </Flex>
        ) : (
          children
        )}
      </Flex>
    </ListPage>
  );
};
