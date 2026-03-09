import { Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import { ShowCubesMarketModel } from '@/modules/stream-flow/features/cubes/market';
import { CubeInfoWrapper } from '@/modules/stream-flow/features/cubes/market/ui/components/cube-info-wrapper';
import { CubesListWrapper } from '@/modules/stream-flow/features/cubes/market/ui/components/cubes-list-wrapper';
import { GlobalLoader } from '@/shared/ui/loaders';

interface Props {
  showUseButton?: boolean;
}

export const CubesMarket = ({ showUseButton }: Props) => {
  const [list, loading, failed] = useUnit([
    ShowCubesMarketModel.$cubesList,
    ShowCubesMarketModel.$loadingCubesList,
    ShowCubesMarketModel.$failedCubesList,
  ]);

  if (loading || !list) {
    return <GlobalLoader />;
  }
  if (failed) {
    return (
      <Text variant="subheader-2" color="danger" style={{ margin: 'auto' }}>
        Error fetching data from the server
      </Text>
    );
  }
  if (list.length === 0) {
    return (
      <Text variant="subheader-2" style={{ margin: 'auto' }}>
        You dont have any available cubes
      </Text>
    );
  }

  return (
    <>
      <CubesListWrapper list={list} />
      <CubeInfoWrapper showUseButton={showUseButton} />
    </>
  );
};
