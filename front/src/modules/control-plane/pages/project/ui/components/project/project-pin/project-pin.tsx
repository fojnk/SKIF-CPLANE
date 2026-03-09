import { StarFill } from '@gravity-ui/icons';
import { Flex, Icon } from '@gravity-ui/uikit';
import cx from 'clsx';
import { useUnit } from 'effector-react';
import React from 'react';

import { ProjectPinModel } from '@/modules/control-plane/features/project/pin';
import { ProjectUnpinModel } from '@/modules/control-plane/features/project/unpin';

import css from './project-pin.module.scss';
interface Props {
  isPinned: boolean;
  id: number;
}
export const ProjectPin = ({ isPinned, id }: Props) => {
  const [pin, unpin, pendingPin, pendingUnpin] = useUnit([
    ProjectPinModel.start,
    ProjectUnpinModel.start,
    ProjectPinModel.$pending,
    ProjectUnpinModel.$pending,
  ]);

  const handlePinClick = () => {
    if (pendingPin || pendingUnpin) return;
    if (isPinned) {
      unpin(id);
    } else {
      pin(id);
    }
  };

  return (
    <Flex
      className={cx(css.projectPin, isPinned ? css.pinned : '')}
      onClick={handlePinClick}
    >
      <Icon size={18} data={StarFill} className="no-shrink" />
    </Flex>
  );
};
