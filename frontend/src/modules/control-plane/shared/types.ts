import { controlPlaneApi } from '@/modules/control-plane/shared/api';

export interface ControlPlaneError {
  status: number;
  statusText: string | null;
  message: string | null;
}

export interface PaginationData {
  page: number;
  pageSize: number;
}
export interface PageDataDC {
  page: number;
  limit: number;
}
export interface DataPair {
  id: number;
  name: string;
}
export type UserRightsDC = controlPlaneApi.dc.DtoUserRightsDC;
export type PipeDsCatalog = controlPlaneApi.dc.DtoDatasetShortDC;
export type DSCatalog = controlPlaneApi.dc.DtoDatasetInfoDC;
export type ProjectCatalog = controlPlaneApi.dc.DtoProjectInfoDC;
export type PipeVersionDC = controlPlaneApi.dc.DtoExperimentVersionDC;
export type ExperimentParams = controlPlaneApi.dc.DtoCompleteExperimentListDC;
export type ProjectDC = controlPlaneApi.dc.DtoProjectDC;
export type ProjectInfoDC = controlPlaneApi.dc.ResponsesGetProjectV2ResponseDC;
export type DatasetDC = controlPlaneApi.dc.DtoDatasetDC;
export type DatasetV2DC = controlPlaneApi.dc.V2DatasetListDataDC;
export type SearchProjectRequest =
  controlPlaneApi.dc.RequestsListProjectsRequestV2DC;
export type SearchDsRequest = controlPlaneApi.dc.RequestsSearchDatasetsRequestDC;
export type DsFilters = controlPlaneApi.dc.DtoDatasetFiltersDC;
export type DsVersionInfoDC = controlPlaneApi.dc.DtoDatasetVersionTemplateDC;
export type DsVersionDC = controlPlaneApi.dc.DtoDatasetVersionDC;
export type SearchPipeDsRequest =
  controlPlaneApi.dc.RequestsGetExperimentAvailableDatasetsToLinkRequestDC;
export type ClonePipeRequest =
  controlPlaneApi.dc.RequestsCopyCompleteExperimentRequestDC;
export type CloneDsRequest = controlPlaneApi.dc.RequestsCopyDatasetRequestV2DC;
export type NamespaceDC = controlPlaneApi.dc.DtoNamespaceDC;
export type NamespaceInfoDC = controlPlaneApi.dc.ResponsesGetNamespaceResponseDC;
export type AclRightDC = controlPlaneApi.dc.AclRightDC;
export type ExperimentDC =
  controlPlaneApi.dc.ResponsesGetCompleteExperimentsResponseDC;
export type ExperimentDsLinkDC = controlPlaneApi.dc.DtoExperimentDatasetDC;
export type DsExperimentLinkDC = controlPlaneApi.dc.DtoDatasetExperimentLinkDC;
export type ParamsDC = controlPlaneApi.dc.ParamsParamDC;
export type JobsDC = controlPlaneApi.dc.JobdJobDC;
export type JobsDCStatus = controlPlaneApi.dc.JobdJobStatusDC;
export type CubeListDC = controlPlaneApi.dc.DtoCubeDC;
export type CubeInfoDC = controlPlaneApi.dc.ResponsesGetCubeResponseDC;
export type EditorConfigType = 'project' | 'ds' | 'pipe' | 'ns' | 'ds2';
export type EditorModeType = 'form' | 'code';
export type EntityType = 'namespace' | 'dataset' | 'experiment' | 'project';
export enum DatasetType {
  JSON = 'json',
  KAFKA = 'kafka',
}
export interface EditorDataDC {
  id: number;
  name: string;
  type: EditorConfigType;
  canEdit: boolean;
  config: string;
  /** additional_information для пайплайнов (cubeConfig с CubeTypeID и InputNames) */
  additional_information?: string;
  project?: DataPair;
}
export type ExperimentTabType =
  | 'config'
  | 'monitoring'
  | 'grafana'
  | 'ds'
  | 'acl'
  | 'history'
  | 'versions'
  | 'links'
  | 'var'
  | 'jobs';

export type ProjectTabType = 'content' | 'config' | 'acl' | 'history' | 'links';
export type DatasetTabType =
  | 'config'
  | 'schema'
  | 'links'
  | 'versions'
  | 'acl'
  | 'history'
  | 'jobs';

export type NamespaceTabType = 'config' | 'acl' | 'history';

export type accessFilter = 'all' | 'public' | 'private';

export interface DsCatalogFilter {
  limit: number;
  offset: number;
  search?: string;
  type?: string;
  namespace_id?: number;
  project_id?: number;
  public?: boolean;
  order_by?: string;
}

export interface ProjectCatalogFilter {
  limit: number;
  offset: number;
  search?: string;
  namespace_id?: number;
  order_by?: string;
}

export interface LogDataDC {
  id: number;
  act: string;
  created_at: string;
  name: string;
  user: string;
  comment: string;
  job_id?: number;
}
export interface LogsRequest {
  id: number;
  from: number;
  limit: number;
  type: EntityType;
}
export interface LogDataRequest {
  log_id: number;
  type: EntityType;
}

export interface ControlPlaneUser {
  id: number;
  name: string;
}

export enum LogAction {
  New = 'new',
  Update = 'update',
  Delete = 'delete',
  StartExperiment = 'start',
  StopExperiment = 'stop',
  ApplyExperiment = 'apply',
  DatasetAdd = 'new dataset link',
  DatasetDelete = 'delete dataset link',
  UpdateDatasetLink = 'update dataset link',
  NewVariable = 'new variable',
  UpdateVariable = 'update variable',
  DeleteVariable = 'delete variable',
}

export interface DatasetDiff {
  name?: boolean;
  params?: boolean;
  schema?: boolean;
  type?: boolean;
  public?: boolean;
}

export interface NamespaceDiff {
  config?: boolean;
  name?: boolean;
}

export interface ProjectDiff {
  config?: boolean;
  name?: boolean;
  description?: boolean;
}

export interface ExperimentDiff {
  config?: boolean;
  name?: boolean;
  description?: boolean;
  dataset_alias?: boolean;
}

//experiment versions
export type ExperimentVariableItem =
  controlPlaneApi.dc.DtoExperimentVariableShortDC;
export type VariableVersion = controlPlaneApi.dc.DtoExperimentVariableVersionDC;
export type VariableVersionInfo =
  controlPlaneApi.dc.DtoExperimentVariableVersionTemplateDC;
