import { Dialog, Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';
import { Form } from 'react-final-form';

import {
  ExperimentRenameForm,
  ExperimentRenamePayload,
  ExperimentRenameModel,
} from '@/modules/control-plane/features/experiment/rename';
import {
  FormFieldInput,
  FormFieldTextarea,
  SfDialogFooter,
} from '@/modules/control-plane/shared/ui';
import { validators } from '@/shared/lib/final-form';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ExperimentRenamePayload>) => {
  const [pending, onSubmit] = useUnit([
    ExperimentRenameModel.$pending,
    ExperimentRenameModel.onSubmit,
  ]);
  const handleSubmit = (form: ExperimentRenameForm) => {
    onSubmit({
      name: form.name,
      description: form.description || '',
      experiment_id: payload.experiment_id,
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
      <Form
        onSubmit={handleSubmit}
        initialValues={{ name: payload.name, description: payload.description }}
      >
        {({ handleSubmit, valid, pristine }) => {
          return (
            <form onSubmit={handleSubmit} name="sf-pipe-update">
              <Dialog.Header caption="Редактировать эксперимент" />
              <Dialog.Body>
                <Flex direction="column" gapRow={2}>
                  <FormFieldInput
                    fieldName="name"
                    label="Название"
                    validate={validators.required}
                    required
                    hasClear
                  />
                  <FormFieldTextarea
                    fieldName="description"
                    label="Описание"
                    hasClear
                  />
                </Flex>
              </Dialog.Body>
              <SfDialogFooter
                disabled={!valid || pristine}
                onClose={onClose}
                onSubmit={handleSubmit}
                pending={pending}
              />
            </form>
          );
        }}
      </Form>
    </Dialog>
  );
};
