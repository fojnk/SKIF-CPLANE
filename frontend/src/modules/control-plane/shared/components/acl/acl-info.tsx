import { Flex, Pagination, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { useEffect, useMemo } from 'react';

import { AclInfoModel } from '@/modules/control-plane/entities/acl/info';
import {
  AclMy,
  AclUsersTable,
  ErrorMessage,
} from '@/modules/control-plane/shared/components';
import { EntityType } from '@/modules/control-plane/shared/types';
import { SearchInput } from '@/modules/control-plane/shared/ui';
import { pageSizeOptions } from '@/modules/control-plane/shared/utils/pageDataHelpers';
import { GlobalLoader } from '@/shared/ui/loaders';

interface AclInfoProps {
  objectType: EntityType;
  objectId: number;
}

export const AclInfo = ({ objectType, objectId }: AclInfoProps) => {
  const acl = useUnit(AclInfoModel);

  const entityObject = useMemo(
    () => ({
      object_id: objectId,
      object_type: objectType,
    }),
    [objectId, objectType],
  );

  useEffect(() => {
    acl.loadRights(entityObject);
    acl.updateFilter({ ...entityObject, offset: 0 });

    return () => {
      acl.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityObject]);

  const handleReload = () => {
    acl.loadRights(entityObject);
    acl.updateFilter({ ...entityObject, offset: 0 });
  };

  const handleSearchChange = (search: string) => {
    acl.updateFilter({ search, offset: 0 });
  };

  const handlePageUpdate = (page: number, pageSize: number) => {
    acl.updateFilter({ offset: (page - 1) * pageSize, limit: pageSize });
  };

  if (acl.$loading && (!acl.$users || !acl.$rights)) {
    return <GlobalLoader absolute />;
  }

  return (
    <Flex
      direction="column"
      gap={5}
      style={{ maxWidth: '1000px', position: 'relative' }}
    >
      <Flex direction="column" gap={2}>
        <Text variant="subheader-2">Ваши права</Text>
        {acl.$failedMy ? (
          <ErrorMessage
            message="Не удалось загрузить права"
            reload={handleReload}
            pending={acl.$loading}
          />
        ) : (
          <AclMy rights={acl.$rights ?? []} objectType={objectType} />
        )}
      </Flex>
      <Flex direction="column" gap={3}>
        <Flex direction="column" gap={1}>
          <Text variant="subheader-2" style={{ marginBottom: '3px' }}>
            Права пользователей
          </Text>
          {acl.$failedUsers ? (
            <ErrorMessage
              message="Не удалось загрузить права пользователей"
              reload={handleReload}
              pending={acl.$loading}
            />
          ) : (
            <>
              <SearchInput
                search={acl.$filter.search}
                setSearch={handleSearchChange}
                placeholder="Поиск по пользователю"
              />
              <Flex direction="column" style={{ position: 'relative' }}>
                {acl.$loading && <GlobalLoader absolute size="m" />}
                <AclUsersTable
                  data={acl.$users ?? []}
                  objectType={objectType}
                  hasSearch={!!acl.$filter.search?.trim()}
                />
              </Flex>
            </>
          )}
        </Flex>
        <Flex direction="row" justifyContent="center">
          <Pagination
            total={acl.$total}
            page={Math.floor(acl.$filter.offset / acl.$filter.limit) + 1}
            pageSize={acl.$filter.limit}
            pageSizeOptions={[...pageSizeOptions]}
            onUpdate={handlePageUpdate}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};
