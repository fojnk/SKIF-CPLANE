import { Dialog, Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';
import { Form } from 'react-final-form';

import {
  NsRenameModel,
  RenameForm,
  RenamePayload,
} from '@/modules/control-plane/features/namespace/rename';
import {
  FormFieldInput,
  SfDialogFooter,
} from '@/modules/control-plane/shared/ui';
import { validators } from '@/shared/lib/final-form';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<RenamePayload>) => {
  const [pending, onSubmit] = useUnit([
    NsRenameModel.$pending,
    NsRenameModel.submitRename,
  ]);
  const handleSubmit = (form: RenameForm) => {
    const request = {
      id: payload.id,
      name: form.name,
    };
    onSubmit(request);
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
      <Form onSubmit={handleSubmit} initialValues={{ name: payload.name }}>
        {({ handleSubmit, valid, pristine }) => {
          return (
            <form onSubmit={handleSubmit} name="sf-namespace-rename">
              <Dialog.Header caption={`Переименовать ${payload.name}`} />
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
