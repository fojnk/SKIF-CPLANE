import { Dialog, Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';
import { Form } from 'react-final-form';

import {
  CreateForm,
  NsCreateModel,
} from '@/modules/stream-flow/features/namespace/create';
import {
  FormFieldInput,
  SfDialogFooter,
} from '@/modules/stream-flow/shared/ui';
import { validators } from '@/shared/lib/final-form';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({ open, onClose, reset }: ModalViewProps) => {
  const [pending, onSubmit] = useUnit([
    NsCreateModel.$pending,
    NsCreateModel.onSubmit,
  ]);

  const handleSubmit = (form: CreateForm) => {
    onSubmit(form.name);
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
            <form onSubmit={handleSubmit} name="sf-ns-create">
              <Dialog.Header caption="Новое рабочее пространство" />
              <Dialog.Body>
                <Flex direction="column" gapRow={2}>
                  <FormFieldInput
                    fieldName="name"
                    label="Название"
                    validate={validators.required}
                    required
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
