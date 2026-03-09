import React from 'react';

import { ParamsDC } from '@/modules/stream-flow/shared/types';

import { FormParamView } from '../form-param-view';
import { getFormInitialValues } from '../utils';

import { FormContainer } from './form-container';

const isJsonValid = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

interface Props {
  config: string;
  formParams?: ParamsDC[];
  readonly?: boolean;
  type: 'project' | 'dataset';
}

export const ConfigFormViewer = ({ config, formParams }: Props) => {
  if (!formParams || formParams.length === 0) {
    return <FormContainer>No form parameters available</FormContainer>;
  }
  if (!isJsonValid(config)) {
    return <FormContainer>Invalid JSON</FormContainer>;
  }

  // Получаем значения из config БЕЗ default значений (режим просмотра)
  const configValues = getFormInitialValues(config, formParams, false);

  return (
    <FormContainer>
      <FormParamView
        params={formParams}
        values={configValues as Record<string, unknown>}
        disclosure
        defaultOpen
      />
    </FormContainer>
  );
};
