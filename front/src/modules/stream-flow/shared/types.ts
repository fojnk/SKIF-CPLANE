import { streamFlowApi } from '@/modules/stream-flow/shared/api';

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
export type UserRightsDC = streamFlowApi.dc.DtoUserRightsDC;
export type PipeDsCatalog = streamFlowApi.dc.DtoDatasetShortDC;
export type DSCatalog = streamFlowApi.dc.DtoDatasetInfoDC;
export type ProjectCatalog = streamFlowApi.dc.DtoProjectInfoDC;
export type PipeVersionDC = streamFlowApi.dc.DtoExperimentVersionDC;
export type ExperimentParams = streamFlowApi.dc.DtoCompleteExperimentListDC;
export type ProjectDC = streamFlowApi.dc.DtoProjectDC;
export type ProjectInfoDC = streamFlowApi.dc.ResponsesGetProjectV2ResponseDC;
export type DatasetDC = streamFlowApi.dc.DtoDatasetDC;
export type DatasetV2DC = streamFlowApi.dc.V2DatasetListDataDC;
export type SearchProjectRequest =
  streamFlowApi.dc.RequestsListProjectsRequestV2DC;
export type SearchDsRequest = streamFlowApi.dc.RequestsSearchDatasetsRequestDC;
export type DsFilters = streamFlowApi.dc.DtoDatasetFiltersDC;
export type DsVersionInfoDC = streamFlowApi.dc.DtoDatasetVersionTemplateDC;
export type DsVersionDC = streamFlowApi.dc.DtoDatasetVersionDC;
export type SearchPipeDsRequest =
  streamFlowApi.dc.RequestsGetExperimentAvailableDatasetsToLinkRequestDC;
export type ClonePipeRequest =
  streamFlowApi.dc.RequestsCopyCompleteExperimentRequestDC;
export type CloneDsRequest = streamFlowApi.dc.RequestsCopyDatasetRequestV2DC;
export type NamespaceDC = streamFlowApi.dc.DtoNamespaceDC;
export type NamespaceInfoDC = streamFlowApi.dc.ResponsesGetNamespaceResponseDC;
export type AclRightDC = streamFlowApi.dc.AclRightDC;
export type ExperimentDC =
  streamFlowApi.dc.ResponsesGetCompleteExperimentsResponseDC;
export type ExperimentDsLinkDC = streamFlowApi.dc.DtoExperimentDatasetDC;
export type DsExperimentLinkDC = streamFlowApi.dc.DtoDatasetExperimentLinkDC;
export type ParamsDC = streamFlowApi.dc.ParamsParamDC;
export type JobsDC = streamFlowApi.dc.JobdJobDC;
export type JobsDCStatus = streamFlowApi.dc.JobdJobStatusDC;
export type CubeListDC = streamFlowApi.dc.DtoCubeDC;
export type CubeInfoDC = streamFlowApi.dc.ResponsesGetCubeResponseDC;
export type EditorConfigType = 'project' | 'ds' | 'pipe' | 'ns' | 'ds2';
export type EditorModeType = 'form' | 'code';
export type EntityType = 'namespace' | 'dataset' | 'experiment' | 'project';
export enum DatasetType {
  QUEUE = 'Queue',
  KEY_VALUE = 'KeyValue',
  STATIC_TABLE_DIR = 'StaticTableDir',
  KAFKA = 'Kafka',
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
  | 'jobs'
  | 'alerts';

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
  cluster?: string;
  managed?: boolean;
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
  managed?: boolean;
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
  streamFlowApi.dc.DtoExperimentVariableShortDC;
export type VariableVersion = streamFlowApi.dc.DtoExperimentVariableVersionDC;
export type VariableVersionInfo =
  streamFlowApi.dc.DtoExperimentVariableVersionTemplateDC;
