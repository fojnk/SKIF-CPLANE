import { CircleInfoFill } from '@gravity-ui/icons';
import { Dialog, Flex, Icon, Tooltip, Text } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';
import { Form } from 'react-final-form';

import {
  AddForm,
  AddPayload,
  ExperimentAddDsModel,
} from '@/modules/stream-flow/features/experiment/dataset/add';
import { DsSelector } from '@/modules/stream-flow/features/experiment/dataset/add/ui/components';
import { DsForm } from '@/modules/stream-flow/features/experiment/dataset/add/ui/components/ds-form';
import { DatasetDC } from '@/modules/stream-flow/shared/types';
import { SfDialogFooter } from '@/modules/stream-flow/shared/ui/sf-dialog-footer';
import { useValue } from '@/shared/lib/react/hooks/use-value';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  reset,
  payload,
}: ModalViewProps<AddPayload>) => {
  const selectedDS = useValue<DatasetDC | null>(null);
  const [pending, onSubmit] = useUnit([
    ExperimentAddDsModel.$pending,
    ExperimentAddDsModel.linkDataset,
  ]);

  const handleSubmit = (form: AddForm) => {
    if (selectedDS.value) {
      onSubmit({
        alias: form.alias,
        dataset_id: selectedDS.value.id!,
        experiment_id: payload.experiment_id,
      });
    }
  };

  return (
    <Dialog
      onTransitionOutComplete={reset}
      open={open}
      onClose={onClose}
      size={selectedDS.value ? 'm' : 'l'}
      disableOutsideClick
      className="sf-dialog"
    >
      <Form onSubmit={handleSubmit}>
        {({ handleSubmit, valid }) => {
          return (
            <form onSubmit={handleSubmit} name="sf-pipe-ds-add">
              <Dialog.Header
                caption={
                  selectedDS.value ? (
                    <Text variant="subheader-3">Привязать датасет</Text>
                  ) : (
                    <Flex direction="row" gap={2} alignItems="center">
                      <Text variant="subheader-3">Выберите датасет</Text>
                      <Text color="info">
                        <Tooltip
                          content="Только публичные датасеты и датасеты текущего проекта"
                          openDelay={0}
                          placement="right"
                        >
                          <Icon data={CircleInfoFill} />
                        </Tooltip>
                      </Text>
                    </Flex>
                  )
                }
              />

              {selectedDS.value ? (
                <>
                  <Dialog.Body>
                    <DsForm
                      selectedDS={selectedDS.value}
                      onResetSelected={() => {
                        selectedDS.set(null);
                      }}
                    />
                  </Dialog.Body>
                  <SfDialogFooter
                    disabled={!valid || selectedDS.value === null}
                    onClose={onClose}
                    onSubmit={handleSubmit}
                    pending={pending}
                    textApply="Создать"
                  />
                </>
              ) : (
                <Dialog.Body>
                  <DsSelector
                    onSelect={selectedDS.set}
                    experiment_id={payload.experiment_id}
                  />
                </Dialog.Body>
              )}
            </form>
          );
        }}
      </Form>
    </Dialog>
  );
};
