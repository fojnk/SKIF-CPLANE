import { Flex, TextInput } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { namespacesPageModel } from '@/modules/stream-flow/pages/namespaces';

export const NamespacesFilters = () => {
  const [search, setSearch] = useUnit([
    namespacesPageModel.list.$search,
    namespacesPageModel.list.setSearch,
  ]);

  return (
    <Flex direction="row" className="no-shrink">
      <TextInput
        value={search}
        onUpdate={setSearch}
        placeholder="Search by name or id"
        size="l"
        hasClear
      />
    </Flex>
  );
};
