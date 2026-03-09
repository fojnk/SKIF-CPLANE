import { Dialog, Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';
import { Form } from 'react-final-form';

import {
  ProjectRenameModel,
  ProjectRenamePayload,
  RenameForm,
} from '@/modules/stream-flow/features/project/rename';
import {
  FormFieldInput,
  FormFieldTextarea,
  SfDialogFooter,
} from '@/modules/stream-flow/shared/ui';
import { validators } from '@/shared/lib/final-form';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ProjectRenamePayload>) => {
  const [pending, renameProject] = useUnit([
    ProjectRenameModel.$pending,
    ProjectRenameModel.renameProject,
  ]);
  const handleSubmit = (form: RenameForm) => {
    const request = {
      id: payload.id,
      name: form.name,
      description: form.description,
    };
    renameProject(request);
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
            <form onSubmit={handleSubmit} name="sf-prj-update">
              <Dialog.Header caption={`Редактировать ${payload.name}`} />
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
