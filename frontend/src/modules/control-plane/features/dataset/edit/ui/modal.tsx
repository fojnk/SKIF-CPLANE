import { Dialog, Flex, Switch } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';
import { Field, Form } from 'react-final-form';

import {
  DsEditPayload,
  DsEditModel,
  EditForm,
} from '@/modules/control-plane/features/dataset/edit';
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
}: ModalViewProps<DsEditPayload>) => {
  const [pending, renameDataset] = useUnit([
    DsEditModel.$pending,
    DsEditModel.renameDataset,
  ]);
  const handleSubmit = (form: EditForm) => {
    const request = {
      id: payload.id,
      ...form,
    };
    renameDataset(request);
  };

  const initialValues = {
    name: payload.name,
    public: payload.public,
    managed: payload.managed,
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
      <Form onSubmit={handleSubmit} initialValues={initialValues}>
        {({ handleSubmit, valid, pristine }) => {
          return (
            <form onSubmit={handleSubmit} name="sf-ns-update">
              <Dialog.Header caption="Редактировать датасет" />
              <Dialog.Body>
                <Flex direction="column" gapRow={4}>
                  <FormFieldInput
                    fieldName="name"
                    label="Название"
                    validate={validators.required}
                    required
                    hasClear
                  />
                  <Flex direction="row" gap={4}>
                    <Field name="managed" type="chechbox">
                      {({ input }) => (
                        <Switch
                          content="Управляемый"
                          checked={input.value}
                          size="m"
                          onChange={(e) => input.onChange(e.target.checked)}
                        />
                      )}
                    </Field>
                    <Field name="public" type="chechbox">
                      {({ input }) => (
                        <Switch
                          content="Публичный"
                          checked={input.value}
                          size="m"
                          onChange={(e) => input.onChange(e.target.checked)}
                        />
                      )}
                    </Field>
                  </Flex>
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
