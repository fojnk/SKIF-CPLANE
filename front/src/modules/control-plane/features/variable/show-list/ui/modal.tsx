import { ArrowRotateLeft, Pipeline, Plus } from '@gravity-ui/icons';
import {
  Table,
  Flex,
  withTableCopy,
  configure,
  Lang,
  Label,
  Text,
  Dialog,
  Icon,
  Button,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useState } from 'react';

import { ExperimentVariablesModel } from '@/modules/control-plane/entities/variables/list';
import { VariableCreateModel } from '@/modules/control-plane/features/variable/create';
import { VariableShowModel } from '@/modules/control-plane/features/variable/version/show';
import { ErrorMessage } from '@/modules/control-plane/shared/components/sf-errors';
import { ExperimentVariableItem } from '@/modules/control-plane/shared/types';
import {
  getTypeTheme,
  getTypeLabel,
} from '@/modules/control-plane/shared/utils/variablesHelpers';
import { GlobalLoader } from '@/shared/ui/loaders';
import { ModalViewProps } from '@/shared/ui/modals';

import { VariableShowListPayload } from '../types';

import styles from './modal.module.scss';

const TableWithCopy = withTableCopy<ExperimentVariableItem>(Table);

const TableRenderer = TableWithCopy;

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<VariableShowListPayload>) => {
  const variablesModel = useUnit(ExperimentVariablesModel.list);
  const showVariable = useUnit(VariableShowModel.start);
  const startCreateVariable = useUnit(VariableCreateModel.start);

  // Используем переданные данные или загружаем из модели
  const experimentName = payload.experiment_name;

  // Флаг: был ли выполнен refresh (после refresh используем данные из модели)
  const [wasRefreshed, setWasRefreshed] = useState(false);

  // Если переменные не переданы в payload, загружаем их
  const hasPassedVariables = payload.variables !== undefined;

  // Загружаем переменные только если они не переданы
  useEffect(() => {
    if (open && !hasPassedVariables) {
      variablesModel.load(payload.experiment_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, payload.experiment_id, hasPassedVariables]);

  // Сбрасываем флаг wasRefreshed при закрытии модалки
  useEffect(() => {
    if (!open) {
      setWasRefreshed(false);
    }
  }, [open]);

  // Переключаемся на данные из модели после создания переменной
  useEffect(() => {
    const unsubscribe = VariableCreateModel.success.watch(() => {
      setWasRefreshed(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    configure({ lang: Lang.En });
  }, []);

  // Данные переменных: из модели (если был refresh) или из payload
  const useModelData = wasRefreshed || !hasPassedVariables;
  const variablesData = useModelData ? variablesModel.$data : payload.variables;
  const isFailed = useModelData ? variablesModel.$failed : false;
  // Показываем loader только при первичной загрузке (когда данных ещё нет)
  const isInitialLoading =
    useModelData && variablesModel.$loading && !variablesModel.$data;

  // Определяем права доступа (можно расширить позже, если нужно передавать права)
  const canEdit = true; // По умолчанию только просмотр

  const columns = React.useMemo(
    () => [
      {
        id: 'type',
        name: 'Тип',
        width: 50,
        align: 'end' as const,
        meta: {
          selectedAlways: true,
          sort: () => 0,
        },
        template: (item: ExperimentVariableItem) => (
          <Label theme={getTypeTheme(item.type)} size="xs">
            {getTypeLabel(item.type)}
          </Label>
        ),
      },
      {
        id: 'name',
        name: 'Переменная',
        meta: {
          selectedAlways: true,
          sort: () => 0,
          copy: (item: ExperimentVariableItem) => `\${${item.name}}`,
        },
        template: (item: ExperimentVariableItem) => (
          <Flex
            alignItems="center"
            style={{ height: '100%', width: '100%', overflow: 'hidden' }}
          >
            <Text variant="body-1" ellipsis style={{ fontWeight: 500 }}>
              {item.name}
            </Text>
          </Flex>
        ),
      },
    ],
    [],
  );

  const columnsWithOriginalNames = React.useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        meta: {
          ...(column as any).meta,
          _originalName:
            typeof column.name === 'function'
              ? String((column.name as () => string)())
              : String(column.name as string),
        },
      })),
    [columns],
  );

  const handleRowClick = (item: ExperimentVariableItem) => {
    showVariable({
      item,
      canEdit,
      mode: 'view',
      head: true,
    });
  };

  const handleCreateVariable = () => {
    startCreateVariable({
      parent: 'experiment',
      parent_id: payload.experiment_id,
    });
  };

  const handleRefresh = () => {
    setWasRefreshed(true);
    variablesModel.load(payload.experiment_id);
  };

  const headerCaption = experimentName ? (
    <Flex direction="row" gap={2} alignItems="center">
      <Icon data={Pipeline} size={18} />
      <Text variant="subheader-1">{experimentName}</Text>
      <Text variant="subheader-1" color="secondary">
        переменные
      </Text>
    </Flex>
  ) : (
    'Переменные'
  );

  if (isInitialLoading) {
    return (
      <Dialog open={open} onClose={onClose} onTransitionOutComplete={reset}>
        <GlobalLoader size="m" />
      </Dialog>
    );
  }

  if (isFailed) {
    return (
      <Dialog open={open} onClose={onClose} onTransitionOutComplete={reset}>
        <Dialog.Header caption={headerCaption} />
        <Dialog.Body>
          <ErrorMessage
            message="Не удалось загрузить переменные"
            reload={() => variablesModel.load(payload.experiment_id)}
            pending={variablesModel.$loading}
          />
        </Dialog.Body>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onTransitionOutComplete={reset}
      size="m"
      className={styles.variableListDialog}
    >
      <Dialog.Header caption={headerCaption} />
      <Dialog.Body>
        <Flex
          direction="column"
          gapRow={2}
          style={{ width: '100%', position: 'relative' }}
        >
          {!variablesData || variablesData.length === 0 ? (
            <Flex direction="row">Переменные не найдены</Flex>
          ) : (
            <TableRenderer
              data={variablesData}
              columns={columnsWithOriginalNames}
              emptyMessage="Переменные не найдены"
              className="table--full-width"
              onRowClick={handleRowClick}
              getRowDescriptor={(item) => ({ id: item.id!.toString() })}
            />
          )}
        </Flex>
      </Dialog.Body>
      <Dialog.Footer>
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          style={{ width: '100%' }}
        >
          <Flex direction="row" gap={2}>
            <Button size="l" view="action" onClick={handleCreateVariable}>
              <Button.Icon>
                <Plus />
              </Button.Icon>
              Новая переменная
            </Button>
            <Button
              size="l"
              view="outlined"
              onClick={handleRefresh}
              loading={variablesModel.$loading}
            >
              <Button.Icon>
                <ArrowRotateLeft />
              </Button.Icon>
            </Button>
          </Flex>
          <Button size="l" view="outlined" onClick={onClose}>
            Закрыть
          </Button>
        </Flex>
      </Dialog.Footer>
    </Dialog>
  );
};
