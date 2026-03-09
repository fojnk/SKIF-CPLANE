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
import React, { useMemo, useState } from 'react';

import { ResharderViewPayload } from '@/modules/stream-flow/features/cubes/resharder-view/types';
import { FormParamView } from '@/modules/stream-flow/shared/components/forms';
import { ModalViewProps } from '@/shared/ui/modals';

export const Modal = ({
  open,
  onClose,
  payload,
  reset,
}: ModalViewProps<ResharderViewPayload>) => {
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

  // Получаем значения для таба Resharder
  const resharderValues = useMemo(() => {
    const resharderValue = payload.initialValues['Resharder'];
    if (
      resharderValue &&
      typeof resharderValue === 'object' &&
      !Array.isArray(resharderValue)
    ) {
      return resharderValue as Record<string, unknown>;
    }
    return {};
  }, [payload.initialValues]);

  // Получаем значения для таба Resources (Resources.Resharder)
  const resourcesValues = useMemo(() => {
    const resourcesValue = payload.initialValues['Resources'];
    if (
      resourcesValue &&
      typeof resourcesValue === 'object' &&
      !Array.isArray(resourcesValue)
    ) {
      const resourcesObj = resourcesValue as Record<string, unknown>;
      const resharderValue = resourcesObj['Resharder'];
      if (
        resharderValue &&
        typeof resharderValue === 'object' &&
        !Array.isArray(resharderValue)
      ) {
        return resharderValue as Record<string, unknown>;
      }
    }
    return {};
  }, [payload.initialValues]);

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
                  <FormParamView
                    params={resharderParams}
                    values={resharderValues}
                    disclosure
                    defaultOpen
                    defaultExpanded
                    variableNames={payload.variableNames}
                    onVariableClick={payload.onVariableClick}
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
                  <FormParamView
                    params={resourcesParams}
                    values={resourcesValues}
                    disclosure
                    defaultOpen
                    defaultExpanded
                    variableNames={payload.variableNames}
                    onVariableClick={payload.onVariableClick}
                  />
                )}
              </Flex>
            </TabPanel>
          </Flex>
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
