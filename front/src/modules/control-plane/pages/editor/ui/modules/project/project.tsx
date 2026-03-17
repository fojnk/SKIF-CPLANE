import { Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo, useRef } from 'react';
import { Form } from 'react-final-form';

import { projectFormModel } from '@/modules/control-plane/entities/forms/project';
import { formParamsSettingsModel } from '@/modules/control-plane/entities/settings/form-params';
import { editorPageModel } from '@/modules/control-plane/pages/editor';
import {
  convertFormValuesToJson,
  FormContainer,
  FormParamEdit,
  getFormInitialValues,
} from '@/modules/control-plane/shared/components/forms';
import { formatData } from '@/modules/control-plane/shared/utils/formatData';

import { EditorJson } from '../../components/editor-json';
import { EditorLayout } from '../../components/editor-layout';

// Компонент для отслеживания изменений формы
const FormValuesObserver = ({
  values,
  formParams,
  setForm,
  originalConfig,
}: {
  values: Record<string, any>;
  formParams: any[];
  setForm: (value: string) => void;
  originalConfig: string;
}) => {
  const isFirstRender = useRef(true);
  const prevValuesRef = useRef<string>('');

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValuesRef.current = JSON.stringify(values);

      try {
        const typedValues = convertFormValuesToJson(
          values,
          formParams,
          originalConfig,
        );
        const jsonString = formatData(JSON.stringify(typedValues));
        setForm(jsonString);
      } catch (error) {
        console.error('Failed to stringify initial form values:', error);
      }
      return;
    }

    const currentValuesStr = JSON.stringify(values);
    if (currentValuesStr === prevValuesRef.current) {
      return;
    }
    prevValuesRef.current = currentValuesStr;

    try {
      const typedValues = convertFormValuesToJson(
        values,
        formParams,
        originalConfig,
      );
      const jsonString = formatData(JSON.stringify(typedValues));
      setForm(jsonString);
    } catch (error) {
      console.error('Failed to stringify form values:', error);
    }
  }, [values, formParams, setForm, originalConfig]);

  return null;
};

export const Project = () => {
  const [data, currentConfig, setCurrentConfig] = useUnit([
    editorPageModel.editor.$data,
    editorPageModel.editor.$currentConfig,
    editorPageModel.editor.setCurrentConfig,
  ]);

  const [updateProject, queryParams] = useUnit([
    editorPageModel.project.updateProject,
    editorPageModel.query.$queryParams,
  ]);

  const [projectFormData, settings] = useUnit([
    projectFormModel.$data,
    formParamsSettingsModel.$settings,
  ]);

  const currentMode = queryParams.mode || 'code';

  const handleSave = (disableValidation?: boolean) => {
    if (data?.id) {
      updateProject({
        id: data.id,
        config: currentConfig,
        disable_validation: disableValidation,
      });
    }
  };

  const initialValues = useMemo(
    () => getFormInitialValues(currentConfig, projectFormData ?? undefined),
    [currentConfig, projectFormData],
  );
  const hasFormParams = projectFormData && projectFormData.length > 0;

  return (
    <EditorLayout onSave={handleSave}>
      {currentMode === 'form' && hasFormParams ? (
        <FormContainer paddingTop>
          <Form
            onSubmit={() => {}}
            initialValues={initialValues}
            subscription={{ values: true }}
          >
            {({ values }) => (
              <>
                <FormValuesObserver
                  values={values}
                  formParams={projectFormData}
                  setForm={setCurrentConfig}
                  originalConfig={data?.config ?? ''}
                />
                <form name="Config-Form-Edit">
                  <Flex
                    direction="column"
                    gap={3}
                    style={{
                      width: '100%',
                      maxWidth:
                        settings.width === 'fixed' ? '1024px' : undefined,
                      minWidth:
                        settings.width === 'fixed' ? '600px' : undefined,
                    }}
                  >
                    <FormParamEdit
                      params={projectFormData}
                      size="m"
                      addButtonVariant="normal"
                      disclosure
                      defaultOpen
                    />
                  </Flex>
                </form>
              </>
            )}
          </Form>
        </FormContainer>
      ) : (
        <EditorJson />
      )}
    </EditorLayout>
  );
};
