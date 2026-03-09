import { Cubes3 } from '@gravity-ui/icons';
import { Button, Icon, Popover } from '@gravity-ui/uikit';

import { ShowCubesMarketModel } from '@/modules/stream-flow/features/cubes/market';

import styles from './market-button.module.scss';

interface MarketButtonProps {
  position: 'left' | 'right';
  showAddButton?: boolean;
}

export const MarketButton = ({
  position,
  showAddButton = false,
}: MarketButtonProps) => {
  const wrapperClass =
    position === 'left'
      ? `${styles.wrapper} ${styles.wrapperLeft}`
      : `${styles.wrapper} ${styles.wrapperRight}`;

  return (
    <div className={wrapperClass}>
      <Popover
        content={<span style={{ padding: '5px' }}>Models Market</span>}
        placement="top"
        openDelay={50}
        closeDelay={50}
      >
        <Button
          view="flat-action"
          size="m"
          onClick={() =>
            ShowCubesMarketModel.start({
              canAdd: showAddButton,
            })
          }
        >
          <Icon data={Cubes3} />
        </Button>
      </Popover>
    </div>
  );
};
