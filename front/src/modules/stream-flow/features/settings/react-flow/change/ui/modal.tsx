import { Button, Dialog, Flex, Switch } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import { useEffect, useRef } from 'react';
import { Form, Field } from 'react-final-form';

import { reactFlowSettingsModel } from '@/modules/stream-flow/entities/settings/react-flow';
import * as ChangeReactFlowSettingsModel from '@/modules/stream-flow/features/settings/react-flow/change/model';
import {
  ChangeReactFlowSettingsPayload,
  ReactFlowSettingsForm,
  settingsToForm,
} from '@/modules/stream-flow/features/settings/react-flow/change/types';
import { ModalViewProps } from '@/shared/ui/modals';

// Компонент для отслеживания изменений формы и автосохранения
const FormValuesObserver = ({
  values,
  onSubmit,
}: {
  values: ReactFlowSettingsForm;
  onSubmit: (form: ReactFlowSettingsForm) => void;
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
}: ModalViewProps<ChangeReactFlowSettingsPayload>) => {
  const [settings, onSubmit, onResetToDefaults] = useUnit([
    reactFlowSettingsModel.$settings,
    ChangeReactFlowSettingsModel.submit,
    ChangeReactFlowSettingsModel.resetToDefaults,
  ]);

  const initialValues = settingsToForm(settings);
  const handleSubmit = (form: ReactFlowSettingsForm) => {
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
      size="s"
      disableOutsideClick
      className="sf-dialog"
    >
      <Form onSubmit={handleSubmit} initialValues={initialValues}>
        {({ handleSubmit: formHandleSubmit, values }) => {
          return (
            <form onSubmit={formHandleSubmit} name="sf-react-flow-settings">
              <FormValuesObserver values={values} onSubmit={onSubmit} />
              <Dialog.Header caption="Graph Settings" />
              <Dialog.Body>
                <Flex direction="column" gap={4}>
                  {/* Show dots on background */}
                  <Flex direction="column" gap={2}>
                    <strong>Background</strong>
                    <Field name="showDotsBackground" type="checkbox">
                      {({ input }) => (
                        <Switch
                          size="m"
                          checked={input.checked}
                          onUpdate={input.onChange}
                        >
                          Show dots on background
                        </Switch>
                      )}
                    </Field>
                  </Flex>
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
