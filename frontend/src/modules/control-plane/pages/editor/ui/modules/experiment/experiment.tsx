import { useUnit } from 'effector-react';
import React, { useEffect, useMemo, useRef } from 'react';
import { Form } from 'react-final-form';

import {
  convertCubesToFormFormat,
  buildFullCubeConfigJsonWithPositions,
  type GraphNodePosition,
  type PortInfo,
  type EditFormCube,
} from '@/modules/control-plane/entities/cubes';
import { experimentFormModel } from '@/modules/control-plane/entities/forms/experiment';
import { editorPageModel } from '@/modules/control-plane/pages/editor';
import { convertFormValuesToJson } from '@/modules/control-plane/shared/components/forms';
import { formatData } from '@/modules/control-plane/shared/utils/formatData';
import type { ParamsDC } from '@/modules/control-plane/shared/types';

import { EditorJson } from '../../components/editor-json';
import { EditorLayout } from '../../components/editor-layout';

import {
  initExperimentEditorValues,
  ExperimentEditForm,
  hasWorkerParam,
  type ExperimentFormValues,
} from './experiment-edit';

/**
 * Observer для синхронизации формы → JSON конфиг
 * Конвертирует значения формы в JSON и сохраняет в currentConfig
 */
const FormValuesObserver = ({
  values,
  formParams,
  setForm,
  originalConfig,
}: {
  values: ExperimentFormValues;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formParams: any[];
  setForm: (value: string) => void;
  originalConfig: string;
}) => {
  const prevValuesRef = useRef<string>('');

  useEffect(() => {
    const schema = formParams as ParamsDC[];
    const hasWorker = hasWorkerParam(schema);

    if (!hasWorker) {
      const currentValuesStr = JSON.stringify(values);
      if (currentValuesStr === prevValuesRef.current) {
        return;
      }
      prevValuesRef.current = currentValuesStr;

      try {
        const typedValues = convertFormValuesToJson(
          values as Record<string, unknown>,
          schema,
          originalConfig,
        ) as Record<string, unknown>;

        if (!Array.isArray(typedValues.models)) {
          typedValues.models = [];
        }

        let finalValues: Record<string, unknown> = typedValues;
        if (originalConfig) {
          try {
            const originalObj =
              typeof originalConfig === 'string'
                ? JSON.parse(originalConfig)
                : originalConfig;
            if (originalObj && typeof originalObj === 'object') {
              const orderedValues: Record<string, unknown> = {};
              const originalKeys = Object.keys(originalObj);
              const resultKeys = new Set(Object.keys(typedValues));

              originalKeys.forEach((key: string) => {
                if (resultKeys.has(key)) {
                  orderedValues[key] = typedValues[key];
                  resultKeys.delete(key);
                }
              });

              resultKeys.forEach((key) => {
                orderedValues[key] = typedValues[key];
              });

              finalValues = orderedValues;
            }
          } catch {
            // ignore
          }
        }

        setForm(formatData(JSON.stringify(finalValues)));
      } catch (error) {
        console.error('Failed to stringify form values:', error);
      }
      return;
    }

    // Streamflow: кубы в Worker.GraphConfig + Resharder
    const formCubes = values?.Worker?.GraphConfig?.Cubes || {};
    const resharderInputSources: PortInfo[] = [];

    const inputSources = values?.Resharder?.InputSources;
    if (Array.isArray(inputSources)) {
      inputSources.forEach((source) => {
        if (source?.portHash) {
          const displayName =
            source.OutputName && source.OutputName.trim() !== ''
              ? source.OutputName
              : source.SourceName || '';
          if (displayName) {
            resharderInputSources.push({
              name: displayName,
              hash: source.portHash,
            });
          }
        }
      });
    }

    const jsonCubes = convertCubesToFormFormat(
      formCubes,
      resharderInputSources,
    );

    const valuesWithCubes = {
      ...values,
      Worker: {
        ...values?.Worker,
        GraphConfig: {
          ...values?.Worker?.GraphConfig,
          Cubes: jsonCubes,
        },
      },
    };

    const currentValuesStr = JSON.stringify(valuesWithCubes);
    if (currentValuesStr === prevValuesRef.current) {
      return;
    }
    prevValuesRef.current = currentValuesStr;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const typedValues = convertFormValuesToJson(
        values,
        formParams,
        originalConfig,
      ) as any;

      if (!typedValues.Worker) {
        typedValues.Worker = {};
      }
      if (!typedValues.Worker.GraphConfig) {
        typedValues.Worker.GraphConfig = {};
      }
      typedValues.Worker.GraphConfig = {
        ...typedValues.Worker.GraphConfig,
        Cubes: jsonCubes,
      };

      if (!typedValues.Resharder) {
        typedValues.Resharder = {};
      }

      // Восстанавливаем порядок ключей первого уровня из оригинального конфига
      let finalValues = typedValues;
      if (originalConfig) {
        try {
          const originalObj =
            typeof originalConfig === 'string'
              ? JSON.parse(originalConfig)
              : originalConfig;
          if (originalObj && typeof originalObj === 'object') {
            const orderedValues: Record<string, unknown> = {};
            const originalKeys = Object.keys(originalObj);
            const resultKeys = new Set(Object.keys(typedValues));

            // Сначала добавляем ключи в порядке оригинального конфига
            originalKeys.forEach((key: string) => {
              if (resultKeys.has(key)) {
                orderedValues[key] = typedValues[key];
                resultKeys.delete(key);
              }
            });

            // Затем добавляем новые ключи
            resultKeys.forEach((key) => {
              orderedValues[key] = typedValues[key];
            });

            finalValues = orderedValues;
          }
        } catch {
          // Игнорируем ошибку парсинга
        }
      }

      const jsonString = formatData(JSON.stringify(finalValues));
      setForm(jsonString);
    } catch (error) {
      console.error('Failed to stringify form values:', error);
    }
  }, [values, formParams, setForm, originalConfig]);

  return null;
};

/**
 * Observer для синхронизации формы → cubeConfig (additional_information)
 * Собирает CubeTypeID, InputNames и Graph (позиции узлов) из кубов формы
 */
const CubeConfigObserver = ({
  values,
  setCubeConfig,
  graphNodePositions,
  enabled,
}: {
  values: ExperimentFormValues;
  setCubeConfig: (value: string) => void;
  graphNodePositions: GraphNodePosition[];
  enabled: boolean;
}) => {
  const prevCubeConfigRef = useRef<string>('');

  useEffect(() => {
    if (!enabled) {
      return;
    }
    // Получаем кубы из формы
    const formCubes = values?.Worker?.GraphConfig?.Cubes || {};
    const cubesArray = Object.values(formCubes) as EditFormCube[];

    // Строим полный cubeConfig JSON с данными графа
    const cubeConfigJson = buildFullCubeConfigJsonWithPositions(
      cubesArray,
      graphNodePositions,
    );

    // Проверяем изменения
    if (cubeConfigJson === prevCubeConfigRef.current) {
      return;
    }
    prevCubeConfigRef.current = cubeConfigJson;

    setCubeConfig(cubeConfigJson);
  }, [
    enabled,
    values?.Worker?.GraphConfig?.Cubes,
    setCubeConfig,
    graphNodePositions,
  ]);

  return null;
};

export const Experiment = () => {
  const [
    data,
    currentConfig,
    currentCubeConfig,
    graphNodePositions,
    setCurrentConfig,
    setCurrentCubeConfig,
    updateExperiment,
    queryParams,
  ] = useUnit([
    editorPageModel.editor.$data,
    editorPageModel.editor.$currentConfig,
    editorPageModel.editor.$currentCubeConfig,
    editorPageModel.editor.$graphNodePositions,
    editorPageModel.editor.setCurrentConfig,
    editorPageModel.editor.setCurrentCubeConfig,
    editorPageModel.experiment.updateExperiment,
    editorPageModel.query.$queryParams,
  ]);
  const [experimentFormData, experimentFormLoading, loadExperimentForm] =
    useUnit([
      experimentFormModel.$data,
      experimentFormModel.$loading,
      experimentFormModel.load,
    ]);
  const [cubesList] = useUnit([editorPageModel.cubes.$data]);
  const variablesData = useUnit(editorPageModel.variables.$data);
  const currentMode = queryParams.mode || 'code';

  // При hot reload данные формы могут сброситься в null — перезагружаем их
  useEffect(() => {
    if (experimentFormData === null && !experimentFormLoading) {
      loadExperimentForm();
    }
  }, [experimentFormData, experimentFormLoading, loadExperimentForm]);

  const handleSave = (disableValidation?: boolean) => {
    if (data?.id) {
      updateExperiment({
        experiment_id: data.id,
        config: currentConfig,
        // Передаём cubeConfig (additional_information) при сохранении
        additional_information: currentCubeConfig,
        disable_validation: disableValidation,
      });
    }
  };

  // Инициализируем форму с кубами
  // Используем data.config и data.additional_information для инициализации,
  // а не currentConfig/currentCubeConfig (которые могут быть изменены)
  const initialValues = useMemo(
    () =>
      initExperimentEditorValues(
        data?.config ?? '',
        data?.additional_information ?? '',
        experimentFormData ?? undefined,
        cubesList,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data?.config, data?.additional_information, experimentFormData, cubesList],
  );
  const hasFormParams = experimentFormData && experimentFormData.length > 0;
  const hasWorkerPipeline = useMemo(
    () => hasWorkerParam(experimentFormData ?? undefined),
    [experimentFormData],
  );

  return (
    <EditorLayout onSave={handleSave}>
      {currentMode === 'form' && hasFormParams ? (
        <Form
          onSubmit={() => {}}
          initialValues={initialValues}
          subscription={{ values: true }}
        >
          {({ values }) => (
            <>
              <FormValuesObserver
                values={values as ExperimentFormValues}
                formParams={experimentFormData}
                setForm={setCurrentConfig}
                originalConfig={data?.config ?? ''}
              />
              <CubeConfigObserver
                values={values as ExperimentFormValues}
                setCubeConfig={setCurrentCubeConfig}
                graphNodePositions={graphNodePositions}
                enabled={hasWorkerPipeline}
              />
              {data && (
                <ExperimentEditForm
                  formData={experimentFormData}
                  experiment_id={data.id!}
                  experiment_name={data.name!}
                  variables={variablesData}
                />
              )}
            </>
          )}
        </Form>
      ) : (
        <EditorJson />
      )}
    </EditorLayout>
  );
};
