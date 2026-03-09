import { Dialog, Flex, Text, TextArea } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';
import { Field, Form } from 'react-final-form';

import { SetVersionCommentModel } from '@/modules/stream-flow/features/version/comment/set-comment';
import { PipeVersionDC } from '@/modules/stream-flow/shared/types';
import { SfDialogFooter } from '@/modules/stream-flow/shared/ui';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  reset,
  payload,
}: ModalViewProps<PipeVersionDC>) => {
  const [pending, updateComment] = useUnit([
    SetVersionCommentModel.$pending,
    SetVersionCommentModel.updateComment,
  ]);

  const handleSubmit = (form: { comment: string }) => {
    updateComment({
      id: payload.id!,
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
            <form onSubmit={handleSubmit} name="sf-namespace-rename">
              <Dialog.Header caption={`Version ${payload.version_id}`} />
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
