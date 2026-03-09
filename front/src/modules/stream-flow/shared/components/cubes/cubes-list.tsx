import { Flex, Text } from '@gravity-ui/uikit';
import cx from 'clsx';
import React, { useCallback } from 'react';

import { CubeListDC } from '@/modules/stream-flow/shared/types';

import css from './cubes.module.scss';

interface CubesListProps {
  list: CubeListDC[];
  selectedCubeId: number | null;
  onSelectCube: (cubeId: number) => void;
}

interface CubeItemProps {
  cube: CubeListDC;
  isSelected: boolean;
  onSelect: (cubeId: number) => void;
}

// Мемоизированный элемент списка
const CubeItem = React.memo<CubeItemProps>(({ cube, isSelected, onSelect }) => {
  // useCallback здесь НУЖЕН, т.к. функция передается в onClick
  // и компонент мемоизирован - без него будет ре-рендер при каждом изменении
  const handleClick = useCallback(() => {
    if (cube.id) {
      onSelect(cube.id);
    }
  }, [cube.id, onSelect]);

  return (
    <Flex
      className={cx(css.cube, isSelected && css.isSelected)}
      gap={2}
      onClick={handleClick}
    >
      <Text variant="body-1" ellipsis ellipsisLines={1}>
        {cube.name}
      </Text>
    </Flex>
  );
});

CubeItem.displayName = 'CubeItem';

export const CubesList = React.memo<CubesListProps>(
  ({ list, selectedCubeId, onSelectCube }) => {
    return (
      <Flex direction="column" className={css.cubesList}>
        {list.map((cube) => (
          <CubeItem
            key={cube.id}
            cube={cube}
            isSelected={selectedCubeId === cube.id}
            onSelect={onSelectCube}
          />
        ))}
      </Flex>
    );
  },
);

CubesList.displayName = 'CubesList';
