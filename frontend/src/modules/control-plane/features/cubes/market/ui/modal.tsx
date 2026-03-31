import { Cubes3 } from '@gravity-ui/icons';
import { Dialog, Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';

import {
  CubesMarketPayload,
  ShowCubesMarketModel,
} from '@/modules/control-plane/features/cubes/market';
import { ModalViewProps } from '@/shared/ui/modals';

import { CubesMarket } from './components';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<CubesMarketPayload>) => {
  const resetData = useUnit(ShowCubesMarketModel.reset);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onTransitionOutComplete={() => {
        resetData();
        reset();
      }}
      size="l"
      disableEscapeKeyDown
      disableOutsideClick
      className="market-dialog"
    >
      <Dialog.Header
        caption={
          <Flex direction="row" gap={2} alignItems="center">
            <Cubes3 />
            Models Market
          </Flex>
        }
      />
      <Dialog.Body>
        <Flex
          direction="row"
          style={{ width: '100%', height: '100%', paddingBottom: '18px' }}
        >
          <CubesMarket showUseButton={payload.canAdd} />
        </Flex>
      </Dialog.Body>
    </Dialog>
  );
};
