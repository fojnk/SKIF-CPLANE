import { Dialog, Flex, Switch } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';
import { Form } from 'react-final-form';

import {
  CreateForm,
  DsCreateModel,
  DsCreatePayload,
} from '@/modules/control-plane/features/dataset/create';
import {
  DsTypeSelector,
  FormFieldInput,
  SfDialogFooter,
} from '@/modules/control-plane/shared/ui';
import { validators } from '@/shared/lib/final-form';
import { useValue } from '@/shared/lib/react/hooks/use-value';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  reset,
  payload,
}: ModalViewProps<DsCreatePayload>) => {
  const isPublic = useValue<boolean>(false);
  const [pending, createDataset] = useUnit([
    DsCreateModel.$pending,
    DsCreateModel.createDataset,
  ]);
  const handleSubmit = (form: CreateForm) => {
    const request = {
      name: form.name,
      type: form.type,
      public: isPublic.value,
      project_id: payload.project_id,
    };
    createDataset(request);
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
      <Form onSubmit={handleSubmit} initialValues={{ type: 'json' }}>
        {({ handleSubmit, valid }) => {
          return (
            <form onSubmit={handleSubmit} name="sf-ds-create">
              <Dialog.Header caption="Новый датасет" />
              <Dialog.Body>
                <Flex direction="column" gapRow={4}>
                  <FormFieldInput
                    fieldName="name"
                    label="Название"
                    validate={validators.required}
                    required
                    hasClear
                  />
                  <DsTypeSelector
                    fieldName="type"
                    label="Тип"
                    validate={validators.required}
                    required
                  />
                  <Switch
                    content="Публичный"
                    checked={isPublic.value}
                    size="m"
                    onChange={(e) => isPublic.set(e.target.checked)}
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
