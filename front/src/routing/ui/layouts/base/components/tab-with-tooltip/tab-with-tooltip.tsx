import { Tab, Tooltip } from '@gravity-ui/uikit';

type TabWithTooltipProps = {
  disabled?: boolean;
  id: string;
  path: string;
  title: string;
  onClick?: VoidFunction;
  delay?: number;
  tooltipContent?: string;
};

export const TabWithTooltip = ({
  disabled,
  id,
  path,
  title,
  onClick,
  delay = 300,
  tooltipContent = 'Мы работаем над этим разделом - надеемся, что он скоро появится :)',
}: TabWithTooltipProps) => {
  if (disabled) {
    return (
      <Tooltip placement="top" content={tooltipContent} openDelay={delay}>
        <div
          style={{
            marginInlineEnd: 'var(--g-tabs-item-gap, var(--_--item-gap))',
            display: 'inline-block',
            cursor: 'not-allowed',
          }}
        >
          <Tab aria-disabled key={id} value={path} id={id} disabled={disabled}>
            {title}
          </Tab>
        </div>
      </Tooltip>
    );
  }
  return (
    <Tab key={id} value={path} id={id} onClick={onClick} disabled={disabled}>
      {title}
    </Tab>
  );
};
