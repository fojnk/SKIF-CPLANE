import { Dialog, Flex, Text, TextArea } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React from 'react';
import { Field, Form } from 'react-final-form';

import {
  SetLogCommentModel,
  SetCommentPayload,
  SetCommentForm,
} from '@/modules/control-plane/features/logs/set-comment';
import { FullDate, SfDialogFooter } from '@/modules/control-plane/shared/ui';
import { getActionColor } from '@/modules/control-plane/shared/utils/getActionColor';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  reset,
  payload,
}: ModalViewProps<SetCommentPayload>) => {
  const [pending, updateComment] = useUnit([
    SetLogCommentModel.$pending,
    SetLogCommentModel.updateComment,
  ]);

  const handleSubmit = (form: SetCommentForm) => {
    updateComment({
      log_id: payload.log.id!,
      new_comment: form.comment ?? '',
      type: payload.type,
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
        initialValues={{ comment: payload.log.comment ?? '' }}
      >
        {({ handleSubmit, pristine }) => {
          return (
            <form onSubmit={handleSubmit} name="sf-namespace-rename">
              <Dialog.Header caption="Edit log comment" />
              <Dialog.Body>
                <Flex direction="column" gapRow={4}>
                  <Flex direction="column" gapRow={2}>
                    {payload.log.created_at && (
                      <Flex direction="row" gap={2}>
                        <FullDate date={payload.log.created_at} />
                        <Flex direction="row" gap={2}>
                          action:
                          <Text
                            variant="body-1"
                            color={getActionColor(payload.log.act)}
                          >{` ${payload.log.act}`}</Text>
                        </Flex>
                      </Flex>
                    )}
                  </Flex>
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
