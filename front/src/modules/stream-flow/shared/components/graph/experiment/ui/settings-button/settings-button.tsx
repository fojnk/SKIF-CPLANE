import { Gear } from '@gravity-ui/icons';
import { Button, Icon, Popover } from '@gravity-ui/uikit';

import { ChangeReactFlowSettingsModel } from '@/modules/stream-flow/features/settings/react-flow/change';

import styles from './settings-button.module.scss';

export const SettingsButton = () => {
  return (
    <div className={styles.wrapper}>
      <Popover
        content={<span style={{ padding: '5px' }}>Graph Settings</span>}
        placement="top"
        openDelay={50}
        closeDelay={50}
      >
        <Button
          view="flat-action"
          size="m"
          onClick={() => ChangeReactFlowSettingsModel.start({})}
        >
          <Icon data={Gear} />
        </Button>
      </Popover>
    </div>
  );
};
