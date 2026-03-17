import { Dialog, Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';
import { Form } from 'react-final-form';

import {
  ExperimentCreateForm,
  ExperimentCreateModel,
  ExperimentCreatePayload,
} from '@/modules/control-plane/features/experiment/create';
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
  reset,
  payload,
}: ModalViewProps<ExperimentCreatePayload>) => {
  const [pending, onSubmit] = useUnit([
    ExperimentCreateModel.$pending,
    ExperimentCreateModel.onSubmit,
  ]);
  const handleSubmit = (form: ExperimentCreateForm) => {
    onSubmit({
      name: form.name,
      description: form.description || '',
      project_id: payload.project_id,
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
      <Form onSubmit={handleSubmit}>
        {({ handleSubmit, valid }) => {
          return (
            <form onSubmit={handleSubmit} name="sf-pipe-create">
              <Dialog.Header caption="Новый эксперимент" />
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
                disabled={!valid}
                onClose={onClose}
                onSubmit={handleSubmit}
                pending={pending}
                textApply="Создать"
              />
            </form>
          );
        }}
      </Form>
    </Dialog>
  );
};
