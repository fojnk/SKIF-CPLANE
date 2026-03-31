import { Dialog, Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';
import { Form } from 'react-final-form';

import {
  ExperimentRenameDsForm,
  ExperimentRenameDsPayload,
  ExperimentRenameDsModel,
} from '@/modules/control-plane/features/experiment/dataset/rename';
import { FormFieldInput } from '@/modules/control-plane/shared/ui/form-field';
import { SfDialogFooter } from '@/modules/control-plane/shared/ui/sf-dialog-footer';
import { validators } from '@/shared/lib/final-form';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ExperimentRenameDsPayload>) => {
  const [pending, onSubmit] = useUnit([
    ExperimentRenameDsModel.$pending,
    ExperimentRenameDsModel.onSubmit,
  ]);
  const handleSubmit = (form: ExperimentRenameDsForm) => {
    onSubmit({
      alias: form.alias,
      experiment_id: payload.experiment_id,
      link_id: payload.link_id,
    });
  };

  return (
    <Dialog
      onTransitionOutComplete={reset}
      open={open}
      onClose={onClose}
      size="s"
      disableOutsideClick
      className="sf-dialog"
    >
      <Form onSubmit={handleSubmit} initialValues={{ alias: payload.alias }}>
        {({ handleSubmit, valid, pristine }) => {
          return (
            <form onSubmit={handleSubmit} name="sf-pipe-ds-update">
              <Dialog.Header caption="Переименовать алиас" />
              <Dialog.Body>
                <Flex direction="column" gapRow={2}>
                  <FormFieldInput
                    fieldName="alias"
                    label="Алиас"
                    validate={validators.required}
                    required
                    hasClear
                  />
                </Flex>
              </Dialog.Body>
              <SfDialogFooter
                disabled={!valid || pristine}
                onClose={onClose}
                onSubmit={handleSubmit}
                pending={pending}
                textApply="Переименовать"
              />
            </form>
          );
        }}
      </Form>
    </Dialog>
  );
};
