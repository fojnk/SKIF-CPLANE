import {
  Dialog,
  TextInput,
  Flex,
  Text,
  Label,
  RadioGroup,
  Button,
  TextArea,
  Disclosure,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useState } from 'react';
import { Field, Form } from 'react-final-form';

import { monacoModel } from '@/modules/stream-flow/entities/monaco';
import { VariableCreateModel } from '@/modules/stream-flow/features/variable/create';
import { ModalFooterControls } from '@/modules/stream-flow/shared/ui/monaco';
import {
  MonacoDialogWrapper,
  SFMonaco,
} from '@/modules/stream-flow/shared/ui/sf-monaco';
import { getMonacoLanguage } from '@/modules/stream-flow/shared/utils/monacoLanguageMapper';
import {
  getTypeTheme,
  getTypeLabel,
} from '@/modules/stream-flow/shared/utils/variablesHelpers';
import { ModalViewProps } from '@/shared/ui/modals';

import { SFVariableCreatePayload, SFVariableCreateForm } from '../types';

const VARIABLE_TYPES: Array<{ value: string; content: React.ReactNode }> = [
  {
    value: 'string',
    content: (
      <Label theme={getTypeTheme('string')} size="xs">
        {getTypeLabel('string')}
      </Label>
    ),
  },
  {
    value: 'json',
    content: (
      <Label theme={getTypeTheme('json')} size="xs">
        {getTypeLabel('json')}
      </Label>
    ),
  },
  {
    value: 'yql',
    content: (
      <Label theme={getTypeTheme('yql')} size="xs">
        {getTypeLabel('yql')}
      </Label>
    ),
  },
  {
    value: 'python',
    content: (
      <Label theme={getTypeTheme('python')} size="xs">
        {getTypeLabel('python')}
      </Label>
    ),
  },
  {
    value: 'int',
    content: (
      <Label theme={getTypeTheme('int')} size="xs">
        {getTypeLabel('int')}
      </Label>
    ),
  },
];

// Validation function
const validate = (values: SFVariableCreateForm) => {
  const errors: Partial<SFVariableCreateForm> = {};

  if (!values.name || !values.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!values.value || !values.value.trim()) {
    errors.value = 'Value is required';
  }

  return errors;
};

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<SFVariableCreatePayload>) => {
  const [pending, createExperimentVariable] = useUnit([
    VariableCreateModel.$pending,
    VariableCreateModel.createExperimentVariable,
  ]);

  const fontSizeNumber = useUnit(monacoModel.$fontSizeNumber);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (formData: SFVariableCreateForm) => {
    if (!payload) {
      return;
    }

    const variable = {
      name: formData.name.trim(),
      type: formData.type,
      value: formData.value.trim(),
    };

    createExperimentVariable({
      experiment_id: payload.parent_id,
      variable,
      comment: formData.comment?.trim() || undefined,
    });
  };

  const renderValueEditor = (type: string) => {
    const shouldUseMonaco = ['json', 'yql', 'string', 'python'].includes(type);

    return (
      <Flex direction="column" gap={1} style={{ height: '100%' }}>
        <Text variant="body-1">
          Value <Text color="danger">*</Text>
        </Text>
        {shouldUseMonaco ? (
          <Field name="value">
            {({ input }) => (
              <div style={{ position: 'relative', height: '100%' }}>
                <MonacoDialogWrapper style={{ position: 'absolute', inset: 0 }}>
                  <SFMonaco
                    language={getMonacoLanguage(type)}
                    value={input.value}
                    onChange={input.onChange}
                    className="monaco-viewer"
                    options={{
                      readOnly: false,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: fontSizeNumber,
                    }}
                  />
                </MonacoDialogWrapper>
              </div>
            )}
          </Field>
        ) : (
          <Field name="value">
            {({ input, meta }) => (
              <TextInput
                value={input.value}
                onUpdate={input.onChange}
                placeholder="Enter integer value"
                size="l"
                validationState={
                  meta.touched && meta.error ? 'invalid' : undefined
                }
                errorMessage={
                  meta.touched && meta.error ? meta.error : undefined
                }
              />
            )}
          </Field>
        )}
      </Flex>
    );
  };

  const initialValues = { name: '', type: 'string', value: '', comment: '' };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="l"
      disableEscapeKeyDown
      disableOutsideClick
      className="variable-dialog"
      onTransitionOutComplete={reset}
    >
      <Form
        onSubmit={handleSubmit}
        initialValues={initialValues}
        validate={validate}
      >
        {({ handleSubmit: formHandleSubmit, values, invalid }) => (
          <>
            <Dialog.Header
              caption={
                <Flex direction="row" alignItems="center" gap={2}>
                  <span>New Variable</span>
                  <Label theme={getTypeTheme(values.type)} size="xs">
                    {getTypeLabel(values.type)}
                  </Label>
                </Flex>
              }
            />
            <Dialog.Body>
              <Flex direction="column" gap={2} style={{ height: '100%' }}>
                <Flex direction="row" gap={4} alignItems="flex-start">
                  <Flex direction="column" gap={1} style={{ flex: 1 }}>
                    <Text variant="body-1">
                      Name <Text color="danger">*</Text>
                    </Text>
                    <Field name="name">
                      {({ input, meta }) => (
                        <TextInput
                          value={input.value}
                          onUpdate={input.onChange}
                          size="m"
                          validationState={
                            meta.touched && meta.error ? 'invalid' : undefined
                          }
                          errorMessage={
                            meta.touched && meta.error ? meta.error : undefined
                          }
                        />
                      )}
                    </Field>
                  </Flex>

                  <Flex direction="column" style={{ paddingTop: '25px' }}>
                    <Field name="type">
                      {({ input }) => (
                        <RadioGroup
                          value={input.value}
                          onUpdate={input.onChange}
                          options={VARIABLE_TYPES}
                          direction="horizontal"
                          size="l"
                        />
                      )}
                    </Field>
                  </Flex>
                </Flex>
                <Flex
                  direction="column"
                  style={
                    ['json', 'yql', 'string', 'python'].includes(values.type)
                      ? { flexGrow: 1, minHeight: 0, height: '100%' }
                      : {}
                  }
                >
                  {renderValueEditor(values.type)}
                </Flex>
                <Flex direction="column" gap={2} className="no-shrink">
                  <Disclosure
                    summary={
                      <Text
                        variant="body-1"
                        color="secondary"
                        style={{ userSelect: 'none' }}
                      >
                        Comment
                      </Text>
                    }
                    arrowPosition="end"
                    expanded={expanded}
                    onUpdate={setExpanded}
                  />
                  {expanded && (
                    <Field name="comment">
                      {({ input }) => (
                        <TextArea
                          value={input.value}
                          onUpdate={input.onChange}
                          placeholder="Enter comment"
                          rows={2}
                          size="m"
                          controlProps={{
                            style: {
                              resize: 'vertical',
                              minHeight: '30px',
                              maxHeight: '120px',
                            },
                          }}
                        />
                      )}
                    </Field>
                  )}
                </Flex>
              </Flex>
            </Dialog.Body>
            <Dialog.Footer>
              <Flex
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
                style={{ width: '100%' }}
              >
                <ModalFooterControls />
                <Flex
                  direction="row"
                  justifyContent="flex-end"
                  gap={2}
                  style={{ width: '100%' }}
                >
                  <Button size="l" onClick={onClose}>
                    Close modal
                  </Button>
                  <Button
                    size="l"
                    view="action"
                    onClick={formHandleSubmit}
                    loading={pending}
                    disabled={invalid || pending}
                  >
                    Create variable
                  </Button>
                </Flex>
              </Flex>
            </Dialog.Footer>
          </>
        )}
      </Form>
    </Dialog>
  );
};
