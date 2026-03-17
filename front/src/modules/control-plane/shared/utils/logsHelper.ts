import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import {
  DatasetDiff,
  NamespaceDiff,
  ProjectDiff,
  ExperimentDiff,
} from '@/modules/control-plane/shared/types';

type DsDetails =
  | controlPlaneApi.dc.UpdateLogDatasetUpdateLogDC
  | null
  | undefined;

type NsDetails =
  | controlPlaneApi.dc.UpdateLogNamespaceUpdateLogDC
  | null
  | undefined;

type ProjectDetails =
  | controlPlaneApi.dc.UpdateLogProjectUpdateLogDC
  | null
  | undefined;

type ExperimentDetails =
  | controlPlaneApi.dc.UpdateLogExperimentUpdateLogDC
  | null
  | undefined;

const isChanged = (oldValue?: string, newValue?: string): boolean => {
  return oldValue !== newValue;
};
const isChangedBool = (oldValue?: boolean, newValue?: boolean): boolean => {
  return oldValue !== newValue;
};

export const dsDiff = (details?: DsDetails): DatasetDiff => {
  if (!details)
    return {
      name: false,
      params: false,
      schema: false,
      type: false,
      public: false,
      managed: false,
    };
  const oldDs = details?.old;
  const newDs = details?.new;

  return {
    name: isChanged(oldDs?.name, newDs?.name),
    params: isChanged(oldDs?.params, newDs?.params),
    schema: isChanged(oldDs?.schema, newDs?.schema),
    type: isChanged(oldDs?.type, newDs?.type),
    public: isChangedBool(oldDs?.public, newDs?.public),
    managed: isChangedBool(oldDs?.managed, newDs?.managed),
  };
};

export const nsDiff = (details?: NsDetails): NamespaceDiff => {
  if (!details)
    return {
      name: false,
      config: false,
    };
  const oldDs = details?.old;
  const newDs = details?.new;

  return {
    name: isChanged(oldDs?.name, newDs?.name),
    config: isChanged(oldDs?.config, newDs?.config),
  };
};

export const projectDiff = (details?: ProjectDetails): ProjectDiff => {
  if (!details)
    return {
      name: false,
      config: false,
    };
  const oldDs = details?.old;
  const newDs = details?.new;

  return {
    name: isChanged(oldDs?.name, newDs?.name),
    config: isChanged(oldDs?.config, newDs?.config),
    description: isChanged(oldDs?.description, newDs?.description),
  };
};

export const pipeDiff = (details?: ExperimentDetails): ExperimentDiff => {
  if (!details)
    return {
      name: false,
      config: false,
      dataset_alias: false,
    };
  const oldDs = details?.old;
  const newDs = details?.new;

  return {
    name: isChanged(oldDs?.name, newDs?.name),
    description: isChanged(oldDs?.description, newDs?.description),
    config: isChanged(oldDs?.config, newDs?.config),
    dataset_alias: isChanged(oldDs?.dataset_alias, newDs?.dataset_alias),
  };
};

export const dsHasDiff = (diff: DatasetDiff): boolean => {
  return Object.values(diff).some(Boolean);
};

export const nsHasDiff = (diff: NamespaceDiff): boolean => {
  return Object.values(diff).some(Boolean);
};

export const projectHasDiff = (diff: ProjectDiff): boolean => {
  return Object.values(diff).some(Boolean);
};

export const pipeHasDiff = (diff: ExperimentDiff): boolean => {
  return Object.values(diff).some(Boolean);
};
