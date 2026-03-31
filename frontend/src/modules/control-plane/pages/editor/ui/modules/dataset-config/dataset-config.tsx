import { Flex } from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo, useRef } from 'react';
import { Form } from 'react-final-form';

import { dsFormModel } from '@/modules/control-plane/entities/forms/dataset';
import { formParamsSettingsModel } from '@/modules/control-plane/entities/settings/form-params';
import { editorPageModel } from '@/modules/control-plane/pages/editor';
import {
  convertFormValuesToJson,
  FormContainer,
  FormParamEdit,
  getFormInitialValues,
} from '@/modules/control-plane/shared/components/forms';
import { DatasetType } from '@/modules/control-plane/shared/types';
import { formatData } from '@/modules/control-plane/shared/utils/formatData';
import { GlobalLoader } from '@/shared/ui/loaders';

import { EditorJson } from '../../components/editor-json';
import { EditorLayout } from '../../components/editor-layout';

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

export const DatasetConfig = () => {
  const [data, currentConfig, setCurrentConfig] = useUnit([
    editorPageModel.editor.$data,
    editorPageModel.editor.$currentConfig,
    editorPageModel.editor.setCurrentConfig,
  ]);

  const [updateDataset, queryParams] = useUnit([
    editorPageModel.dataSource.updateDataset,
    editorPageModel.query.$queryParams,
  ]);

  const [dsFormCache, dsFormLoad, dsFormLoading, datasetData, settings] =
    useUnit([
      dsFormModel.$cache,
      dsFormModel.load,
      dsFormModel.$loading,
      editorPageModel.dataSource.$datasetData,
      formParamsSettingsModel.$settings,
    ]);

  const currentMode = queryParams.mode || 'code';

  // Получаем параметры формы для dataset из кэша
  const dsFormParams = useMemo(() => {
    if (datasetData?.type && datasetData?.managed !== undefined) {
      const cacheKey = dsFormModel.createCacheKey(
        datasetData.type as DatasetType,
        datasetData.managed,
      );
      return dsFormCache[cacheKey] || null;
    }
    return null;
  }, [datasetData, dsFormCache]);

  // Загружаем параметры формы для dataset если их нет в кэше
  useEffect(() => {
    if (
      datasetData?.type &&
      datasetData?.managed !== undefined &&
      !dsFormParams
    ) {
      dsFormLoad({
        type: datasetData.type as DatasetType,
        managed: datasetData.managed,
      });
    }
  }, [datasetData, dsFormParams, dsFormLoad]);

  const handleSave = (disableValidation?: boolean) => {
    if (data?.id) {
      updateDataset({
        id: data.id,
        params: currentConfig,
        name: data.name,
        disable_validation: disableValidation,
      });
    }
  };

  const initialValues = useMemo(
    () => getFormInitialValues(currentConfig, dsFormParams ?? undefined),
    [currentConfig, dsFormParams],
  );

  if (dsFormLoading) {
    return <GlobalLoader absolute />;
  }

  const hasFormParams = dsFormParams && dsFormParams.length > 0;

  return (
    <EditorLayout onSave={handleSave}>
      {hasFormParams && currentMode === 'form' ? (
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
                  formParams={dsFormParams}
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
                      params={dsFormParams}
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
