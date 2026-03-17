import { Flex, Text, Button } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { ShowCubesMarketModel } from '@/modules/control-plane/features/cubes/market';
import { CubeInfo } from '@/modules/control-plane/shared/components/cubes';
import css from '@/modules/control-plane/shared/components/cubes/cubes.module.scss';

interface Props {
  showUseButton?: boolean;
}

const EmptyState = ({ children }: { children: React.ReactNode }) => (
  <Flex className={css.cubesInfo} alignItems="center" justifyContent="center">
    {children}
  </Flex>
);

export const CubeInfoWrapper = ({ showUseButton }: Props) => {
  const [cubes, selectedCubeId, checkout] = useUnit([
    ShowCubesMarketModel.$cubesList,
    ShowCubesMarketModel.$selectedCubeId,
    ShowCubesMarketModel.checkout,
  ]);

  const cube = cubes?.find((c) => c.id === selectedCubeId);

  const onCubeCheckout = () => {
    if (cube) {
      checkout(cube);
    }
  };

  if (!selectedCubeId) {
    return (
      <EmptyState>
        <Text color="secondary" variant="body-2" style={{ opacity: 0.6 }}>
          Select a cube in the list on the left
        </Text>
      </EmptyState>
    );
  }

  if (!cube) {
    return (
      <EmptyState>
        <Text color="secondary" variant="body-2">
          No cube information available
        </Text>
      </EmptyState>
    );
  }

  return (
    <Flex
      direction="column"
      gap={4}
      className={css.cubesInfo}
      justifyContent="space-between"
    >
      <Flex direction="column" gap={3} className={css.cubesInfoWrap}>
        <CubeInfo cube={cube} />
      </Flex>
      {showUseButton && (
        <Flex direction="row" justifyContent="flex-end">
          <Button view="action" size="l" onClick={onCubeCheckout}>
            Add cube
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
