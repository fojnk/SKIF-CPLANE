import { CircleQuestion } from '@gravity-ui/icons';
import { Flex, Icon, Text, Tooltip } from '@gravity-ui/uikit';

export const StatusColumnInfo = () => {
  return (
    <Flex alignItems="center" gap={1}>
      Status
      <Tooltip
        openDelay={150}
        content={
          <Flex direction="column" gap={1}>
            <Text>
              <span style={{ color: 'var(--g-color-base-positive-heavy)' }}>
                completed
              </span>
              <span> — успешно завершено</span>
            </Text>
            <div>
              <span style={{ color: 'var(--g-color-base-info-heavy-hover)' }}>
                running
              </span>
              <span> — выполняется</span>
            </div>
            <div>
              <span style={{ color: 'var(--g-color-base-info-heavy-hover)' }}>
                queued
              </span>
              <span> — в очереди</span>
            </div>
            <div>
              <span style={{ color: 'var(--g-color-base-misc-heavy)' }}>
                pending
              </span>
              <span> — ожидание</span>
            </div>
            <div>
              <span style={{ color: 'rgba(var(--gray-400))' }}>unknown</span>
              <span> — неизвестно / статус не найден</span>
            </div>
            <div>
              <span style={{ color: 'var(--g-color-text-warning-heavy)' }}>
                paused
              </span>
              <span> — приостановлено</span>
            </div>
            <div>
              <span style={{ color: 'var(--g-color-base-danger-heavy)' }}>
                failed
              </span>
              <span> — завершено с ошибкой</span>
            </div>
            <div>
              <span style={{ color: 'var(--g-color-base-danger-heavy)' }}>
                cancelled
              </span>
              <span> — отменено</span>
            </div>
            <div>
              <span style={{ color: 'var(--g-color-base-danger-heavy)' }}>
                timeout
              </span>
              <span> — превышено время выполнения</span>
            </div>
          </Flex>
        }
      >
        <Icon data={CircleQuestion} size={20} />
      </Tooltip>
    </Flex>
  );
};
