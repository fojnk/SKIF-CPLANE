import { Dialog, Flex, Text, TextArea } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';
import { Field, Form } from 'react-final-form';

import { CommentUpdatePayload } from '@/modules/control-plane/features/variable/version/comment/set-comment';
import { UpdateVariableCommentModel } from '@/modules/control-plane/features/variable/version/comment/update';
import { SfDialogFooter } from '@/modules/control-plane/shared/ui';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  reset,
  payload,
}: ModalViewProps<CommentUpdatePayload>) => {
  const [pending, updateComment] = useUnit([
    UpdateVariableCommentModel.$pending,
    UpdateVariableCommentModel.updateComment,
  ]);

  const handleSubmit = (form: { comment: string }) => {
    updateComment({
      id: payload.version_id!,
      comment: form.comment,
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
        initialValues={{ comment: payload.comment ?? '' }}
      >
        {({ handleSubmit, pristine }) => {
          return (
            <form onSubmit={handleSubmit} name="variable-version-comment">
              <Dialog.Header caption={`Version ${payload.version_id_name}`} />
              <Dialog.Body>
                <Flex direction="column" gapRow={1}>
                  <Text variant="body-1" color="secondary">
                    Comment
                  </Text>
                  <Field name="comment">
                    {({ input }) => (
                      <TextArea
                        hasClear
                        minRows={10}
                        value={input.value}
                        onChange={(e) => {
                          input.onChange(e.target.value);
                        }}
                        placeholder="Enter new comment"
                      />
                    )}
                  </Field>
                </Flex>
              </Dialog.Body>
              <SfDialogFooter
                disabled={pristine}
                onClose={onClose}
                onSubmit={handleSubmit}
                pending={pending}
                textApply="Save changes"
              />
            </form>
          );
        }}
      </Form>
    </Dialog>
  );
};
