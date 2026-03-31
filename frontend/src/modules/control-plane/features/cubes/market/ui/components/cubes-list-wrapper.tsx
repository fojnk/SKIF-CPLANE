import { useUnit } from 'effector-react';
import React from 'react';

import { ShowCubesMarketModel } from '@/modules/control-plane/features/cubes/market';
import { DtoCubeDC } from '@/modules/control-plane/shared/api/__generated__/data-contracts';
import { CubesList } from '@/modules/control-plane/shared/components/cubes';

interface CubesListWrapperProps {
  list: DtoCubeDC[];
}

export const CubesListWrapper = ({ list }: CubesListWrapperProps) => {
  const [selectedCubeId, setSelectedCubeId] = useUnit([
    ShowCubesMarketModel.$selectedCubeId,
    ShowCubesMarketModel.setSelectedCubeId,
  ]);

  return (
    <CubesList
      list={list}
      selectedCubeId={selectedCubeId}
      onSelectCube={setSelectedCubeId}
    />
  );
};
