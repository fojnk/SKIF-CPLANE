import { CircleInfo } from '@gravity-ui/icons';
import { Pagination, Select, Text, Tooltip } from '@gravity-ui/uikit';
import cx from 'clsx';
import { useUnit } from 'effector-react';

import { PaginatedTableModel } from '@/shared/lib/complex/paginated-table';
import { Button } from '@/shared/ui/button';
import './table-pagination.scss';

export function TablePagination<Item>({
  table: tableModel,
  selectedCount,
  onResetSelectedItems,
  className,
  hideSizeSelector,
  selectedHint,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: PaginatedTableModel<any, Item>;
  selectedCount?: number;
  onResetSelectedItems?: VoidFunction;
  className?: string;
  hideSizeSelector?: boolean;
  selectedHint?: () => string;
}) {
  const table = useUnit(tableModel);

  const selectedHintText = selectedHint ? selectedHint() : '';

  return (
    <div className={cx('table-pagination', className)}>
      {!hideSizeSelector && (
        <div
          className={cx(
            'table-pagination__item',
            'table-pagination__size-selector',
          )}
        >
          <Select
            value={[`${table.size}`]}
            options={table.pageSizeOptions.map((pageSizeOption) => ({
              value: `${pageSizeOption}`,
              content: `${pageSizeOption}`,
            }))}
            onUpdate={(values) => table.update({ size: +values[0], page: 1 })}
          />
        </div>
      )}
      {!!selectedCount && (
        <div className="table-pagination__item">
          <Text color="hint">Выбрано:</Text>
          <Tooltip disabled={!selectedHintText} content={selectedHintText}>
            <Text
              color={selectedCount ? 'brand' : 'hint'}
              variant="body-1"
              className="table-pagination__selected-count"
            >
              {selectedCount}
              {!!selectedHintText && <CircleInfo />}
            </Text>
          </Tooltip>
          {onResetSelectedItems && (
            <Button
              view="flat"
              onClick={onResetSelectedItems}
              disabled={!selectedCount}
            >
              сбросить
            </Button>
          )}
        </div>
      )}
      {!hideSizeSelector && (
        <div
          className={cx(
            'table-pagination__item',
            'table-pagination__total-info',
          )}
        >
          <Text color="hint">{`${(table.page - 1) * table.size}-${Math.min((table.page - 1) * table.size + table.size, table.total)} из ${table.total}`}</Text>
        </div>
      )}
      <Pagination
        className="table-pagination__pagination"
        page={table.page}
        pageSize={table.size}
        total={table.total}
        compact
        showPages
        showInput={false}
        onUpdate={(page, pageSize) => table.update({ page, size: pageSize })}
      />
    </div>
  );
}
