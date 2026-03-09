import {
  Button,
  Dialog,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabProvider,
  Text,
} from '@gravity-ui/uikit';
import React, { useEffect, useMemo, useState } from 'react';
import { Form, useFormState } from 'react-final-form';

import { ResharderEditPayload } from '@/modules/stream-flow/features/cubes/resharder-edit/types';
import { FormParamEdit } from '@/modules/stream-flow/shared/components/forms';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ResharderEditPayload>) => {
  const [activeTab, setActiveTab] = useState<'resharder' | 'resources'>(
    'resharder',
  );

  // Находим параметр Resharder в formData
  const resharderParam = useMemo(() => {
    return payload.formData.find((param) => param.name === 'Resharder');
  }, [payload.formData]);

  // Находим параметр Resources в formData
  const resourcesParam = useMemo(() => {
    return payload.formData.find((param) => param.name === 'Resources');
  }, [payload.formData]);

  // Находим параметр Resources.Resharder внутри Resources
  const resourcesResharderParam = useMemo(() => {
    if (!resourcesParam?.type?.struct_params) return undefined;
    return resourcesParam.type.struct_params.find(
      (param) => param.name === 'Resharder',
    );
  }, [resourcesParam]);

  // Параметры для таба Resharder
  const resharderParams = useMemo(() => {
    if (!resharderParam?.type?.struct_params) return [];
    return resharderParam.type.struct_params;
  }, [resharderParam]);

  // Параметры для таба Resources (Resources.Resharder)
  const resourcesParams = useMemo(() => {
    if (!resourcesResharderParam?.type?.struct_params) return [];
    return resourcesResharderParam.type.struct_params;
  }, [resourcesResharderParam]);

  // Компонент для синхронизации значений формы
  const FormSync = () => {
    const { values } = useFormState();
    useEffect(() => {
      // Обновляем Resharder
      if (values.Resharder !== undefined) {
        payload.form.change('Resharder', values.Resharder);
      }
      // Обновляем Resources.Resharder
      if (
        values.Resources &&
        typeof values.Resources === 'object' &&
        !Array.isArray(values.Resources) &&
        'Resharder' in values.Resources &&
        values.Resources.Resharder !== undefined
      ) {
        const currentResources = payload.form.getState().values.Resources || {};
        const resourcesValue = values.Resources as Record<string, unknown>;
        payload.form.change('Resources', {
          ...currentResources,
          Resharder: resourcesValue.Resharder,
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values]);
    return null;
  };

  return (
    <TabProvider
      value={activeTab}
      onUpdate={(value) => setActiveTab(value as typeof activeTab)}
    >
      <Dialog
        open={open}
        onClose={onClose}
        onTransitionOutComplete={reset}
        size="l"
        disableEscapeKeyDown
        disableOutsideClick
        className="variable-dialog"
      >
        <Dialog.Header
          caption={
            <TabList>
              <Tab value="resharder">Resharder</Tab>
              <Tab value="resources">Resources</Tab>
            </TabList>
          }
        />
        <Dialog.Body>
          <Form
            onSubmit={() => {}}
            initialValues={payload.initialValues}
            subscription={{ values: true }}
          >
            {() => (
              <>
                <FormSync />
                <Flex
                  direction="column"
                  style={{
                    height: '100%',
                    overflow: 'auto',
                  }}
                >
                  <TabPanel value="resharder">
                    <Flex
                      direction="column"
                      style={{
                        width: '100%',
                      }}
                    >
                      {resharderParams.length === 0 ? (
                        <Text variant="subheader-1" color="secondary">
                          No Resharder parameters
                        </Text>
                      ) : (
                        <FormParamEdit
                          params={resharderParams}
                          fieldNamePrefix="Resharder"
                          size="m"
                          disclosure
                          defaultOpen
                          defaultExpanded
                          maxExpandedLevel={2}
                          addButtonVariant="normal"
                          variableNames={payload.variableNames}
                        />
                      )}
                    </Flex>
                  </TabPanel>
                  <TabPanel value="resources">
                    <Flex
                      direction="column"
                      style={{
                        width: '100%',
                      }}
                    >
                      {resourcesParams.length === 0 ? (
                        <Text variant="subheader-1" color="secondary">
                          No Resources parameters
                        </Text>
                      ) : (
                        <FormParamEdit
                          params={resourcesParams}
                          fieldNamePrefix="Resources.Resharder"
                          size="m"
                          disclosure
                          addButtonVariant="normal"
                          variableNames={payload.variableNames}
                        />
                      )}
                    </Flex>
                  </TabPanel>
                </Flex>
              </>
            )}
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Flex
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            gap={2}
            style={{ width: '100%' }}
          >
            <Button size="l" view="outlined" onClick={onClose}>
              Close
            </Button>
          </Flex>
        </Dialog.Footer>
      </Dialog>
    </TabProvider>
  );
};
