import { CurlyBrackets } from '@gravity-ui/icons';
import { Button, Icon, Popover } from '@gravity-ui/uikit';

import { VariableShowListModel } from '@/modules/stream-flow/features/variable/show-list';
import { ExperimentVariableItem } from '@/modules/stream-flow/shared/types';

import styles from './variables-button.module.scss';

interface VariablesButtonProps {
  position: 'left' | 'right';
  experiment_id: number;
  experiment_name?: string;
  variables?: ExperimentVariableItem[] | null;
}

export const VariablesButton = ({
  position,
  experiment_id,
  experiment_name,
  variables,
}: VariablesButtonProps) => {
  const wrapperClass =
    position === 'left'
      ? `${styles.wrapper} ${styles.wrapperLeft}`
      : `${styles.wrapper} ${styles.wrapperRight}`;

  return (
    <div className={wrapperClass}>
      <Popover
        content={<span style={{ padding: '5px' }}>Experiment Variables</span>}
        placement="top"
        openDelay={50}
        closeDelay={50}
      >
        <Button
          view="flat-action"
          size="m"
          onClick={() =>
            VariableShowListModel.start({
              experiment_id,
              experiment_name,
              variables: variables ?? undefined,
            })
          }
        >
          <Icon data={CurlyBrackets} />
        </Button>
      </Popover>
    </div>
  );
};
