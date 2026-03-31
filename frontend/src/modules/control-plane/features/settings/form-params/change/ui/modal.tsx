import {
  Button,
  Dialog,
  Flex,
  Label,
  Select,
  SegmentedRadioGroup,
  Switch,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useRef } from 'react';
import { Form, Field } from 'react-final-form';

import {
  formParamsSettingsModel,
  LabelColor,
} from '@/modules/control-plane/entities/settings/form-params';
import * as ChangeFormParamsSettingsModel from '@/modules/control-plane/features/settings/form-params/change/model';
import {
  ChangeFormParamsSettingsPayload,
  FormParamsSettingsForm,
  settingsToForm,
} from '@/modules/control-plane/features/settings/form-params/change/types';
import { ModalViewProps } from '@/shared/ui/modals';

const LABEL_COLORS: { value: LabelColor; content: string }[] = [
  { value: 'normal', content: 'Normal' },
  { value: 'info', content: 'Info' },
  { value: 'success', content: 'Success' },
  { value: 'warning', content: 'Warning' },
  { value: 'danger', content: 'Danger' },
  { value: 'utility', content: 'Utility' },
  { value: 'unknown', content: 'Unknown' },
  { value: 'clear', content: 'Clear' },
];

const LABEL_COLOR_OPTIONS = LABEL_COLORS.map((color) => ({
  value: color.value,
  content: color.content,
}));

const PARAM_TYPES = [
  { name: 'integerColor', label: 'Integer' },
  { name: 'doubleColor', label: 'Double' },
  { name: 'stringColor', label: 'String' },
  { name: 'booleanColor', label: 'Boolean' },
  { name: 'arrayColor', label: 'Array' },
  { name: 'kvColor', label: 'Key-Value' },
  { name: 'customColor', label: 'Custom' },
];

// Компонент для отслеживания изменений формы и автосохранения
const FormValuesObserver = ({
  values,
  onSubmit,
}: {
  values: FormParamsSettingsForm;
  onSubmit: (form: FormParamsSettingsForm) => void;
}) => {
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Пропускаем первый рендер (инициализацию)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Сохраняем изменения на лету
    onSubmit(values);
  }, [values, onSubmit]);

  return null;
};

export const Modal = ({
  open,
  onClose,
  reset,
}: ModalViewProps<ChangeFormParamsSettingsPayload>) => {
  const [settings, onSubmit, onResetToDefaults] = useUnit([
    formParamsSettingsModel.$settings,
    ChangeFormParamsSettingsModel.submit,
    ChangeFormParamsSettingsModel.resetToDefaults,
  ]);

  const initialValues = settingsToForm(settings);
  const handleSubmit = (form: FormParamsSettingsForm) => {
    onSubmit(form);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      onResetToDefaults();
    }
  };

  return (
    <Dialog
      onTransitionOutComplete={reset}
      open={open}
      onClose={onClose}
      size="m"
      disableOutsideClick
      className="sf-dialog"
    >
      <Form onSubmit={handleSubmit} initialValues={initialValues}>
        {({ handleSubmit: formHandleSubmit, values }) => {
          const isMulticolor = values.colorTheme === 'multicolor';

          return (
            <form onSubmit={formHandleSubmit} name="sf-form-params-settings">
              <FormValuesObserver values={values} onSubmit={onSubmit} />
              <Dialog.Header caption="Form Settings" />
              <Dialog.Body>
                <Flex direction="column" gap={4}>
                  {/* Width */}
                  <Flex direction="column" gap={2}>
                    <strong>Width</strong>
                    <Field name="width">
                      {({ input }) => (
                        <div style={{ width: 'fit-content' }}>
                          <SegmentedRadioGroup
                            size="m"
                            value={input.value}
                            onUpdate={input.onChange}
                          >
                            <SegmentedRadioGroup.Option
                              value="full"
                              content="Full"
                            />
                            <SegmentedRadioGroup.Option
                              value="fixed"
                              content="Fixed"
                            />
                          </SegmentedRadioGroup>
                        </div>
                      )}
                    </Field>
                  </Flex>

                  {/* Position, Theme and Background */}
                  <Flex direction="row" gap={4}>
                    <Flex direction="column" gap={2}>
                      <strong>Label Theme</strong>
                      <Field name="colorTheme">
                        {({ input }) => (
                          <div style={{ width: 'fit-content' }}>
                            <SegmentedRadioGroup
                              size="m"
                              value={input.value}
                              onUpdate={input.onChange}
                            >
                              <SegmentedRadioGroup.Option
                                value="monochrome"
                                content="Monochrome"
                              />
                              <SegmentedRadioGroup.Option
                                value="multicolor"
                                content="Multicolor"
                              />
                            </SegmentedRadioGroup>
                          </div>
                        )}
                      </Field>
                    </Flex>

                    <Flex direction="column" gap={2}>
                      <strong>Label Background</strong>
                      <Field name="showBackground" type="checkbox">
                        {({ input }) => (
                          <Switch
                            size="m"
                            checked={input.checked}
                            onUpdate={input.onChange}
                          >
                            Show
                          </Switch>
                        )}
                      </Field>
                    </Flex>
                  </Flex>

                  {/* Monochrome Color */}
                  {!isMulticolor && (
                    <Flex direction="column" gap={2} style={{ flex: 1 }}>
                      <strong>Label Color</strong>
                      <Field name="monochromeColor">
                        {({ input }) => (
                          <Flex direction="row" gap={2} alignItems="center">
                            <Select
                              size="m"
                              value={[input.value]}
                              onUpdate={(values) => input.onChange(values[0])}
                              options={LABEL_COLOR_OPTIONS}
                              width="max"
                            />
                            <Label
                              theme={input.value}
                              size="m"
                              className={!values.showBackground ? 'no-bg' : ''}
                            >
                              type label
                            </Label>
                          </Flex>
                        )}
                      </Field>
                    </Flex>
                  )}

                  {/* Multicolor Settings */}
                  {isMulticolor && (
                    <Flex direction="column" gap={3}>
                      <strong>Label Colors</strong>
                      {PARAM_TYPES.map((paramType) => (
                        <Flex key={paramType.name} direction="column" gap={1}>
                          <div
                            style={{
                              fontSize: '13px',
                              color: 'var(--g-color-text-secondary)',
                            }}
                          >
                            {paramType.label}
                          </div>
                          <Field name={paramType.name}>
                            {({ input }) => (
                              <Flex direction="row" gap={2} alignItems="center">
                                <Select
                                  size="m"
                                  value={[input.value]}
                                  onUpdate={(values) =>
                                    input.onChange(values[0])
                                  }
                                  options={LABEL_COLOR_OPTIONS}
                                  width="max"
                                />
                                <Label
                                  theme={input.value}
                                  size="m"
                                  className={
                                    !values.showBackground ? 'no-bg' : ''
                                  }
                                >
                                  {paramType.label.toLowerCase()}
                                </Label>
                              </Flex>
                            )}
                          </Field>
                        </Flex>
                      ))}
                    </Flex>
                  )}
                </Flex>
              </Dialog.Body>
              <Dialog.Footer>
                <Flex
                  direction="row"
                  gap={2}
                  justifyContent="space-between"
                  style={{ width: '100%' }}
                >
                  <Button view="outlined-danger" onClick={handleReset}>
                    Reset to Defaults
                  </Button>
                  <Button view="outlined" onClick={onClose}>
                    Close
                  </Button>
                </Flex>
              </Dialog.Footer>
            </form>
          );
        }}
      </Form>
    </Dialog>
  );
};
