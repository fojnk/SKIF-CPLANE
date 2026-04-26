/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum AclRightDC {
  RightEditConfig = "edit_config",
  RightEditName = "edit_name",
  RightEditSchema = "edit_schema",
  RightCreateProject = "create_project",
  RightCreateDataset = "create_dataset",
  RightCreateExperiment = "create_experiment",
  RightCreateNamespace = "create_namespace",
  RightDeleteExperiment = "delete_experiment",
  RightDeleteDataset = "delete_dataset",
  RightDeleteProject = "delete_project",
  RightDeleteNamespace = "delete_namespace",
  RightStartExperiment = "start_experiment",
  RightStopExperiment = "stop_experiment",
  RightApplyExperiment = "apply_experiment",
  RightCreateVariable = "create_variable",
  RightEditVariable = "edit_variable",
  RightDeleteVariable = "delete_variable",
}

export interface AuthorizeListParamsDC {
  /** redirect url */
  redirect_url?: string;
}

export type ClientsEventDC = {};

export type ClientsEventWithJobDC = {};

export interface ClientsGetJobResponseDC {
  job?: ClientsJobDC;
}

export interface ClientsJobDC {
  id?: number;
  status?: string;
}

export interface ClientsListAllEventsResponseDC {
  events?: ClientsEventWithJobDC[];
  total?: number;
}

export interface ClientsListEventsResponseDC {
  events?: ClientsEventDC[];
  total?: number;
}

export interface ClientsListTasksResponseDC {
  tasks?: ClientsTaskDC[];
}

export type ClientsTaskDC = {};

export interface DtoAppAboutDC {
  content?: string;
  links?: string;
  updated_at?: string;
}

export interface DtoAppBannerDC {
  active?: boolean;
  color?: string;
  color_dark?: string;
  created_at?: string;
  ends?: string;
  id?: number;
  message?: string;
  starts?: string;
  title?: string;
  type?: string;
  updated_at?: string;
}

export interface DtoAppUpcomingDC {
  content?: string;
  updated_at?: string;
}

export interface DtoAppUpdateDC {
  content?: string;
  created_at?: string;
  description?: string;
  id?: number;
  image_url?: string;
  is_published?: boolean;
  release_date?: string;
  title?: string;
  updated_at?: string;
  video_url?: string;
}

export enum DtoBannerTypeDC {
  BannerTypeReleaseBlock = "release_block",
  BannerTypeWarning = "warning",
  BannerTypeInfo = "info",
}

export interface DtoBatchRunResultDC {
  cube_runs?: Record<string, DtoCubeRunResultDC>;
}

export enum DtoClusterDC {
  Miranda = "miranda",
  MercuryKC = "mercury-kc",
  MercuryRC = "mercury-rc",
  MercuryPC = "mercury-pc",
  MercuryHC = "mercury-hc",
  MercuryUC = "mercury-uc",
  Jupiter = "jupiter",
  Moon = "moon",
  Saturn = "saturn",
}

export interface DtoCompleteExperimentListDC {
  id?: number;
  name?: string;
  status?: string;
}

export interface DtoCubeDC {
  author?: string;
  base_cube?: DtoCubeDC;
  cube_params?: string;
  description?: string;
  id?: number;
  name?: string;
  params_name?: string;
  type?: DtoCubeTypeDC;
}

export interface DtoCubeRunResultDC {
  /** @example {"input_data":"[{\"id\"=1};{\"id\"=2}]"} */
  inputs?: Record<string, string>;
  logs?: string[];
  /** @example {"data":"[{\"id\"=1};{\"id\"=2}]"} */
  outputs?: Record<string, string>;
}

export enum DtoCubeTypeDC {
  Resharder = "CIT_RESHARDER",
  CubeT = "CIT_CUBE",
  Retry = "CIT_RETRY",
}

export interface DtoDatasetDC {
  id?: number;
  name?: string;
  params?: string;
  public?: boolean;
  schema?: string;
  type?: string;
  version_id?: number;
}

export interface DtoDatasetExperimentLinkDC {
  alias?: string;
  alias_id?: number;
  experiment_id?: number;
  experiment_name?: string;
  project_id?: number;
  project_name?: string;
}

export interface DtoDatasetFiltersDC {
  cluster?: string;
  namespace_id?: number;
  path?: string;
  project_id?: number;
  public?: boolean | null;
  search?: string;
}

export interface DtoDatasetInfoDC {
  created_at?: string;
  id?: number;
  linked_experiments_count?: number;
  name?: string;
  namespace_info?: DtoNamespaceDC;
  project_info?: DtoProjectCatalogInfoDC;
  public?: boolean;
  rights?: AclRightDC[];
  type?: string;
  updated_at?: string;
}

export interface DtoDatasetShortDC {
  id?: number;
  name?: string;
  namespace_info?: DtoNamespaceDC;
  project_info?: DtoProjectCatalogInfoDC;
  public?: boolean;
  type?: string;
}

export interface DtoDatasetUpdateLogDC {
  act?: string;
  comment?: string;
  created_at?: string;
  id?: number;
  job_id?: number;
  name?: string;
  user?: string;
}

export interface DtoDatasetVersionDC {
  comment?: string;
  created_at?: string;
  creator?: string;
  id?: number;
  version_id?: number;
}

export interface DtoDatasetVersionTemplateDC {
  comment?: string;
  created_at?: string;
  creator?: string;
  id?: number;
  params?: string;
  public?: boolean;
  schema?: string;
  type?: string;
  version_id?: number;
}

export interface DtoExperimentDatasetDC {
  alias?: string;
  dataset_id?: number;
  link_id?: number;
  name?: string;
  project_id?: number;
  project_name?: string;
}

export interface DtoExperimentTemplateDC {
  comment?: string;
  config?: string;
  created_at?: string;
  creator?: string;
  id?: number;
  parent_version_id?: number;
  version_id?: number;
}

export interface DtoExperimentURLDC {
  name?: string;
  url?: string;
}

export interface DtoExperimentUpdateLogDC {
  act?: string;
  comment?: string;
  created_at?: string;
  id?: number;
  job_id?: number;
  name?: string;
  user?: string;
}

export interface DtoExperimentVariableDC {
  id: number;
  name: string;
  type: "string" | "int" | "json" | "yql" | "python";
  value: string;
  version_id?: number;
  version_id_name?: number;
}

export interface DtoExperimentVariableForCreateDC {
  name: string;
  type: "string" | "int" | "json" | "yql" | "python";
  value: string;
}

export interface DtoExperimentVariableForUpdateDC {
  id: number;
  name: string;
  type: "string" | "int" | "json" | "yql" | "python";
  value: string;
}

export interface DtoExperimentVariableShortDC {
  id: number;
  name: string;
  type: "string" | "int" | "json" | "yql" | "python";
  updated_at?: string;
  version_id?: number;
  version_id_name?: number;
}

export interface DtoExperimentVariableVersionDC {
  comment?: string;
  created_at?: string;
  creator?: string;
  head?: boolean;
  id?: number;
  variable_id?: number;
  variable_name?: string;
  variable_type?: string;
  version_id?: number;
}

export interface DtoExperimentVariableVersionTemplateDC {
  comment?: string;
  created_at?: string;
  creator?: string;
  id?: number;
  type?: string;
  value?: string;
  version_id?: number;
}

export interface DtoExperimentVersionDC {
  comment?: string;
  created_at?: string;
  creator?: string;
  id?: number;
  version_id?: number;
}

export interface DtoLogRecordDC {
  entity_name?: string;
  entity_type?: string;
  records?: string[];
}

export interface DtoMatchedRuleDC {
  action?: string;
  object_attribute?: string;
  object_id?: number;
  object_type?: string;
  role_id?: number;
  role_name?: string;
  rule_id?: number;
}

export interface DtoNamespaceConfigDC {
  config?: string;
  created_at?: string;
  id?: number;
}

export interface DtoNamespaceConfigVersionDC {
  created_at?: string;
  id?: number;
}

export interface DtoNamespaceDC {
  id?: number;
  name?: string;
  rights?: AclRightDC[];
}

export interface DtoNamespaceShortDC {
  id?: number;
  name?: string;
}

export interface DtoNamespaceUpdateLogDC {
  act?: string;
  comment?: string;
  created_at?: string;
  id?: number;
  name?: string;
  user?: string;
}

export interface DtoOAuthAccessTokenDC {
  access_token: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}

export interface DtoPermissionDC {
  action?: string;
  object_attribute?: string;
  object_id?: number;
  object_type?: string;
}

export interface DtoPinnedProjectDC {
  id?: number;
  project_id?: number;
  project_name?: string;
}

export interface DtoProjectCatalogInfoDC {
  description?: string;
  id?: number;
  name?: string;
  namespace_id?: number;
  namespace_name?: string;
}

export interface DtoProjectConfigDC {
  config?: string;
  created_at?: string;
  id?: number;
}

export interface DtoProjectConfigVersionDC {
  created_at?: string;
  id?: number;
}

export interface DtoProjectDC {
  config?: string;
  description?: string;
  id?: number;
  is_pinned?: boolean;
  name?: string;
  namespace_id?: number;
  namespace_name?: string;
}

export interface DtoProjectInfoDC {
  created_at?: string;
  dataset_count?: number;
  description?: string;
  experiment_count?: number;
  id?: number;
  is_pinned?: boolean;
  name?: string;
  namespace_id?: number;
  namespace_name?: string;
  rights?: AclRightDC[];
  updated_at?: string;
}

export interface DtoProjectURLDC {
  name?: string;
  url?: string;
}

export interface DtoProjectUpdateLogDC {
  act?: string;
  comment?: string;
  created_at?: string;
  id?: number;
  name?: string;
  user?: string;
}

export interface DtoRoleDC {
  description?: string;
  id?: number;
  name?: string;
}

export interface DtoRuleDC {
  action?: string;
  id?: number;
  object_attribute?: string;
  object_id?: number;
  object_type?: string;
}

export interface DtoRunResultsDC {
  batch_runs?: DtoBatchRunResultDC[];
}

export interface DtoUserDC {
  id?: number;
  name?: string;
}

export interface DtoUserGroupDC {
  id?: number;
  name?: string;
}

export interface DtoUserInfoDC {
  avatar?: string;
  display_name?: string;
  email: string;
  first_name?: string;
  first_name_en?: string;
  is_active?: boolean;
  is_technical_account?: boolean;
  last_name?: string;
  last_name_en?: string;
  ldap_groups?: string[];
  sys_id: number;
  username?: string;
}

export interface DtoUserRightsDC {
  id?: number;
  name?: string;
  rights?: AclRightDC[];
}

export interface DtoValidationErrorDC {
  config_pos?: number;
  entity_name?: string;
  entity_type?: string;
  error_message?: string;
}

export interface DtoValidationErrorResponseDC {
  /** @example ["error1"] */
  errors?: string[];
  /** @example false */
  experiment_is_valid?: boolean;
}

export interface DtoValidationResponseDC {
  errors?: DtoValidationErrorDC[];
  experiment_is_valid?: boolean;
  logs?: DtoLogRecordDC[];
  summary?: string;
}

export interface DtoValidationResponseWithRunDC {
  /** @example ["error1"] */
  errors?: string[];
  /** @example true */
  experiment_is_valid?: boolean;
  logs?: string[];
  run_result?: DtoRunResultsDC;
  /** @example "debug-run completed" */
  summary?: string;
}

export type LogoutListDataDC = any;

export type LogoutListErrorDC = ResponsesErrorResponseDC;

export enum OrchExperimentVariableTypeDC {
  ExperimentVariableTypeString = "string",
  ExperimentVariableTypeInt = "int",
  ExperimentVariableTypeJSON = "json",
  ExperimentVariableTypeYQL = "yql",
  ExperimentVariableTypePython = "python",
}

export interface ParamsParamDC {
  default?: any;
  description?: string;
  name?: string;
  one_of?: ParamsParamDC[];
  required?: boolean;
  type?: ParamsParamTypeDC;
}

export interface ParamsParamTypeDC {
  nested_type?: ParamsTypeDC;
  struct_params?: ParamsParamDC[];
  type?: ParamsTypeDC;
  type_constraint?: ParamsTypeConstraintDC;
}

export enum ParamsStringTypeDC {
  Text = "text",
  Json = "json",
  Python = "python",
  YQL = "yql",
}

export interface ParamsTypeConstraintDC {
  enum?: string[];
  /** int */
  gt?: number;
  /** string */
  length?: number;
  lt?: number;
  multiline?: boolean;
  string_type?: ParamsStringTypeDC;
}

export enum ParamsTypeDC {
  String = "string",
  Integer = "integer",
  Double = "double",
  Boolean = "boolean",
  Array = "array",
  KV = "kv",
  Struct = "struct",
  Custom = "custom",
}

export interface PrivateGetProjectGraphResponseDC {
  graph?: PrivateGraphDC;
}

export interface PrivateGraphDC {
  nodes?: PrivateGraphNodeDC[];
}

export interface PrivateGraphNodeDC {
  id?: number;
  name?: string;
  next?: PrivateGraphNodeDC[];
  status?: string;
  type?: PrivateNodeTypeDC;
}

export enum PrivateNodeTypeDC {
  NodeTypeDataset = "ds",
  NodeTypeExperiment = "experiment",
}

export interface PrivatePingResponseDC {
  message?: string;
}

export interface PrivateVersionResponseDC {
  version?: string;
}

export type RefreshListDataDC = DtoOAuthAccessTokenDC;

export type RefreshListErrorDC = ResponsesErrorResponseDC;

export interface RequestsAddDatasetToExperimentRequestDC {
  alias: string;
  comment?: string;
  dataset_id: number;
  experiment_id: number;
}

export interface RequestsAddPinnedRequestDC {
  project_id: number;
}

export interface RequestsAddRuleToRoleRequestDC {
  role_id: number;
  rule_id: number;
}

export interface RequestsAddUserToGroupRequestDC {
  user_group_id: number;
  user_id: number;
}

export interface RequestsApplyDatasetRequestDC {
  comment?: string;
  dataset_id: number;
}

export interface RequestsApplyExperimentConfigRequestDC {
  comment?: string;
  experiment_id: number;
  single_stage?: boolean;
}

export interface RequestsCompleteExperimentValidateRequestDC {
  experimentConfig: string;
  experimentID?: number;
}

export interface RequestsCopyCompleteExperimentRequestDC {
  /**
   * @minLength 0
   * @maxLength 256
   */
  description?: string;
  /**
   * @minLength 1
   * @maxLength 128
   */
  name: string;
  project_id: number;
  src_experiment_id: number;
}

export interface RequestsCopyDatasetRequestV2DC {
  /** @maxLength 128 */
  name: string;
  project_id?: number;
  src_dataset_id: number;
}

export interface RequestsCreateAppBannerRequestDC {
  active?: boolean;
  color?: string;
  color_dark?: string;
  ends?: string | null;
  message?: string;
  starts?: string | null;
  /**
   * @minLength 0
   * @maxLength 50
   */
  title?: string;
  type?: string | null;
}

export interface RequestsCreateAppUpdateRequestDC {
  /** @minLength 0 */
  content?: string;
  /** @minLength 0 */
  description?: string;
  image_url?: string | null;
  is_published?: boolean;
  release_date?: string;
  /**
   * @minLength 1
   * @maxLength 255
   */
  title?: string;
  video_url?: string | null;
}

export interface RequestsCreateCompleteExperimentRequestDC {
  comment?: string;
  /**
   * @minLength 0
   * @maxLength 256
   */
  description?: string;
  /**
   * @minLength 1
   * @maxLength 128
   */
  name: string;
  project_id: number;
}

export interface RequestsCreateCubeRequestDC {
  cube_params?: string;
  description?: string;
  name: string;
  params_name?: string;
  type?: string;
}

export interface RequestsCreateDatasetRequestV2DC {
  comment?: string;
  /** @maxLength 128 */
  name: string;
  params?: string;
  project_id: number;
  public?: boolean;
  schema?: string;
  /** @maxLength 64 */
  type: "json" | "kafka";
}

export interface RequestsCreateExperimentVariableRequestDC {
  comment?: string;
  experiment_id: number;
  variable: DtoExperimentVariableForCreateDC;
}

export interface RequestsCreateNamespaceRequestDC {
  comment?: string;
  /**
   * @minLength 1
   * @maxLength 10
   */
  name: string;
}

export interface RequestsCreateProjectRequestDC {
  comment?: string;
  description?: string;
  /** @maxLength 128 */
  name: string;
  namespace_id: number;
}

export interface RequestsCreateRoleRequestDC {
  description?: string;
  /** IdmID is an optional stable external key stored in t_role.idm_id; when empty, a value is generated. */
  idm_id?: string;
  /**
   * @minLength 1
   * @maxLength 128
   */
  name: string;
}

export interface RequestsCreateRuleRequestDC {
  action: "00R" | "01E" | "02C" | "03D";
  object_attribute: string;
  object_id: number;
  object_type: "root" | "namespace" | "project" | "experiment" | "dataset" | "cube" | "workspace" | "model";
}

export interface RequestsCreateUserGroupRequestDC {
  /**
   * @minLength 1
   * @maxLength 128
   */
  name: string;
}

export interface RequestsCreateUserRequestDC {
  /**
   * @minLength 1
   * @maxLength 128
   */
  name: string;
}

export interface RequestsDatasetValidateRequestDC {
  datasetConfig: string;
}

export interface RequestsDeleteAppBannerRequestDC {
  id?: number;
}

export interface RequestsDeleteAppUpdateRequestDC {
  id?: number;
}

export interface RequestsDeleteCompleteExperimentRequestDC {
  id: number;
}

export interface RequestsDeleteDatasetRequestDC {
  id: number;
}

export interface RequestsDeleteExperimentVariableRequestDC {
  variable_id: number;
}

export interface RequestsDeleteNamespaceRequestDC {
  id: number;
}

export interface RequestsDeletePinnedProjectRequestDC {
  project_id: number;
}

export interface RequestsDeleteProjectRequestDC {
  id: number;
}

export interface RequestsDisclaimRequestDC {
  role_id?: number;
  rule_id?: number;
  user_group_id?: number;
  user_id?: number;
}

export interface RequestsExperimentStartRequestDC {
  comment?: string;
  experiment_id: number;
}

export interface RequestsExperimentStopRequestDC {
  comment?: string;
  experiment_id: number;
}

export interface RequestsExperimentValidateDataItemDC {
  /** @example "[{"id"=1};{"id"=2}]" */
  data?: string;
  /** @example "output_queue" */
  output_name?: string;
  /** @example "input_queue" */
  source_name?: string;
}

export interface RequestsExperimentValidateFastRequestDC {
  config: string;
  experiment_id?: number;
}

export interface RequestsExperimentValidateRunRequestDC {
  /** @example "{"Meta":{"ExperimentId":"1","ProjectId":"1","Namespace":"test","AbcProductId":"1","YT":{"Token":"test","WorkDir":"//test","Cluster":"test","ProxyRole":"test"}},"Placement":{"OnecloudDatacenters":["kc"]},"Resources":{"Worker":{"ReplicasInDc":1,"CpuCores":1,"RamMB":512,"NetworkInMbit":256,"NetworkOutMbit":20},"Resharder":{"ReplicasInDc":1,"CpuCores":1,"RamMB":512,"NetworkInMbit":256,"NetworkOutMbit":20}},"Worker":{"GraphConfig":{"Name":"Test","Cubes":[]}},"Resharder":{"InputSources":[],"IntermediateQueueOptions":{"ShardsCount":1}},"PublicSources":{},"InternalSources":{}}" */
  config: string;
  data_sets?: RequestsExperimentValidateDataItemDC[][];
  /** @example 1 */
  experiment_id?: number;
  /** @example false */
  should_read_yt_sample?: boolean;
}

export interface RequestsGetExperimentAvailableDatasetsToLinkRequestDC {
  experiment_id: number;
  filters?: DtoDatasetFiltersDC;
  /**
   * @min 1
   * @max 100
   */
  limit: number;
  offset: number;
}

export interface RequestsGrantRequestDC {
  role_id?: number;
  rule_id?: number;
  user_group_id?: number;
  user_id?: number;
}

export interface RequestsListJobsRequestDC {
  created_by?: string;
  entity_id?: number;
  entity_type?: string;
  /**
   * @min 1
   * @max 100
   */
  limit?: number;
  offset?: number;
  order?: string;
  sort?: string;
  status?: string;
  type?: string;
}

export interface RequestsListProjectsRequestV2DC {
  /**
   * @min 1
   * @max 100
   */
  limit: number;
  namespace_id?: number;
  offset: number;
  order_by?: string;
  search?: string;
}

export interface RequestsProjectValidateRequestDC {
  projectConfig: string;
}

export interface RequestsRemoveDatasetFromExperimentRequestDC {
  experiment_id: number;
  link_id: number;
}

export interface RequestsRemoveRuleFromRoleRequestDC {
  role_id: number;
  rule_id: number;
}

export interface RequestsRemoveUserFromGroupRequestDC {
  user_group_id: number;
  user_id: number;
}

export interface RequestsSaveAppliedVersionForExperimentsRequestDC {
  experiment_ids: number[];
}

export interface RequestsSearchDatasetsRequestDC {
  cluster?: string;
  /** Опция полнотекстового поиска */
  exact_match?: boolean | null;
  /**
   * @min 1
   * @max 100
   */
  limit: number;
  namespace_id?: number;
  offset: number;
  order_by?: string;
  path?: string;
  project_id?: number;
  public?: boolean | null;
  search?: string;
  /** @maxLength 64 */
  type?: string;
}

export interface RequestsUpdateAppAboutRequestDC {
  content?: string;
  links?: string;
}

export interface RequestsUpdateAppBannerRequestDC {
  active?: boolean | null;
  color?: string;
  color_dark?: string;
  ends?: string | null;
  id: number;
  message?: string;
  starts?: string | null;
  title?: string;
  type?: string | null;
}

export interface RequestsUpdateAppUpcomingRequestDC {
  content?: string;
}

export interface RequestsUpdateAppUpdateRequestDC {
  /** @minLength 0 */
  content?: string;
  /** @minLength 0 */
  description?: string;
  id: number;
  image_url?: string | null;
  is_published?: boolean | null;
  release_date?: string | null;
  /**
   * @minLength 0
   * @maxLength 255
   */
  title?: string;
  video_url?: string | null;
}

export interface RequestsUpdateCompleteExperimentRequestDC {
  additional_information?: string;
  comment?: string;
  config?: string;
  /**
   * @minLength 0
   * @maxLength 256
   */
  description?: string;
  disable_validation?: boolean;
  experiment_id: number;
  /** @maxLength 128 */
  name?: string;
}

export interface RequestsUpdateCubeRequestDC {
  cube_params?: string;
  description?: string;
  id: number;
  name: string;
  params_name?: string;
  type?: string;
}

export interface RequestsUpdateDatasetLogCommentRequestDC {
  log_id: number;
  new_comment: string;
}

export interface RequestsUpdateDatasetRequestV2DC {
  comment?: string;
  disable_validation?: boolean;
  id: number;
  /** @maxLength 128 */
  name?: string;
  params?: string;
  public?: boolean | null;
  schema?: string;
  /** @maxLength 64 */
  type?: "json" | "kafka";
}

export interface RequestsUpdateDatasetVersionCommentRequestDC {
  comment?: string;
  id: number;
}

export interface RequestsUpdateDatasetVersionRequestDC {
  comment?: string;
  dataset_id: number;
  version_id: number;
}

export interface RequestsUpdateExperimentConfigVersionRequestDC {
  comment?: string;
  experiment_id: number;
  version_id: number;
}

export interface RequestsUpdateExperimentDatasetRequestDC {
  alias: string;
  comment?: string;
  experiment_id: number;
  link_id: number;
}

export interface RequestsUpdateExperimentLogCommentRequestDC {
  log_id: number;
  new_comment: string;
}

export interface RequestsUpdateExperimentVariableRequestDC {
  comment?: string;
  variable: DtoExperimentVariableForUpdateDC;
}

export interface RequestsUpdateExperimentVariableVersionCommentRequestDC {
  comment?: string;
  id: number;
}

export interface RequestsUpdateExperimentVariableVersionRequestDC {
  comment?: string;
  variable_id: number;
  version_id: number;
}

export interface RequestsUpdateExperimentVersionCommentRequestDC {
  comment?: string;
  id: number;
}

export interface RequestsUpdateNamespaceLogCommentRequestDC {
  log_id: number;
  new_comment: string;
}

export interface RequestsUpdateNamespaceRequestDC {
  comment?: string;
  config?: string;
  id: number;
  /** @maxLength 10 */
  name?: string;
}

export interface RequestsUpdateProjectLogCommentRequestDC {
  log_id: number;
  new_comment: string;
}

export interface RequestsUpdateProjectRequestDC {
  comment?: string;
  config?: string;
  description?: string;
  disable_validation?: boolean;
  id: number;
  /** @maxLength 128 */
  name?: string;
}

export interface RequestsUpdateRoleRequestDC {
  description?: string;
  id: number;
  /**
   * @minLength 1
   * @maxLength 128
   */
  name: string;
}

export interface RequestsUpdateUserGroupRequestDC {
  id: number;
  /**
   * @minLength 1
   * @maxLength 128
   */
  name: string;
}

export interface ResponsesAddDatasetToExperimentResponseDC {
  alias?: string;
  dataset_id?: number;
  link_id?: number;
  name?: string;
  project_id?: number;
  project_name?: string;
}

export interface ResponsesAddPinnedProjectResponseDC {
  id?: number;
  project_id?: number;
  project_name?: string;
}

export interface ResponsesCheckACLResponseDC {
  rights?: AclRightDC[];
}

export interface ResponsesCheckExperimentUpdateResponseDC {
  applied_config?: string;
  has_not_applied_changes?: boolean;
  saved_config?: string;
}

export interface ResponsesCheckPermissionsResponseDC {
  permissions?: DtoPermissionDC[];
}

export interface ResponsesCopyCompleteExperimentResponseDC {
  additional_information?: string;
  config?: string;
  description?: string;
  id?: number;
  name?: string;
  project_id?: number;
  project_name?: string;
  status?: string;
}

export interface ResponsesCreateAppBannerResponseDC {
  id?: number;
}

export interface ResponsesCreateAppUpdateResponseDC {
  app_update?: DtoAppUpdateDC;
}

export interface ResponsesCreateCompleteExperimentResponseDC {
  additional_information?: string;
  config?: string;
  description?: string;
  id?: number;
  name?: string;
  project_id?: number;
  project_name?: string;
  status?: string;
}

export interface ResponsesCreateCubeResponseDC {
  author?: string;
  base_cube?: DtoCubeDC;
  cube_params?: string;
  description?: string;
  id?: number;
  name?: string;
  params_name?: string;
  type?: DtoCubeTypeDC;
}

export interface ResponsesCreateDatasetResponseDC {
  id?: number;
  name?: string;
  params?: string;
  public?: boolean;
  schema?: string;
  type?: string;
}

export interface ResponsesCreateExperimentVariableResponseDC {
  variable?: DtoExperimentVariableDC;
}

export interface ResponsesCreateNamespaceResponseDC {
  id?: number;
}

export interface ResponsesCreateProjectResponseDC {
  description?: string;
  id?: number;
  name?: string;
}

export interface ResponsesCreateRoleResponseDC {
  id?: number;
}

export interface ResponsesCreateRuleResponseDC {
  id?: number;
}

export interface ResponsesCreateUserGroupResponseDC {
  id?: number;
}

export interface ResponsesCreateUserResponseDC {
  id?: number;
}

export interface ResponsesCurrentDatasetVersionResponseDC {
  version_id?: number;
}

export interface ResponsesCurrentExperimentVersionResponseDC {
  version_id?: number;
}

export interface ResponsesDatasetExperimentLinksResponseDC {
  links?: DtoDatasetExperimentLinkDC[];
  pages?: number;
  total?: number;
}

export type ResponsesEmptyResponseDC = {};

export interface ResponsesErrorResponseDC {
  external_message?: string;
  http_status_code?: number;
  internal_error?: any;
}

export interface ResponsesSupervisorModelJobDC {
  error_message?: string;
  index?: number;
  model_name?: string;
  status?: string;
}

export interface ResponsesSupervisorExperimentRunDC {
  cancellation_requested?: boolean;
  current_model?: string;
  current_order?: number;
  detail?: string;
  experiment_id?: number;
  jobs?: ResponsesSupervisorModelJobDC[];
  progress?: string;
  status?: string;
  total_models?: number;
}

export interface ResponsesExperimentStatusResponseDC {
  debug?: string;
  message?: string;
  status?: string;
  summary?: string;
  supervisor?: ResponsesSupervisorExperimentRunDC;
}

export interface ResponsesGetAppAboutResponseDC {
  app_about?: DtoAppAboutDC;
}

export interface ResponsesGetAppBannerResponseDC {
  app_banner?: DtoAppBannerDC;
}

export interface ResponsesGetAppIsAdminResponseDC {
  is_admin?: boolean;
}

export interface ResponsesGetAppUpcomingResponseDC {
  app_upcoming?: DtoAppUpcomingDC;
}

export interface ResponsesGetAppUpdateResponseDC {
  app_update?: DtoAppUpdateDC;
}

export interface ResponsesGetAvailableBannerTypesResponseDC {
  types?: DtoBannerTypeDC[];
}

export interface ResponsesGetAvailableDatasetClustersResponseDC {
  clusters?: DtoClusterDC[];
}

export interface ResponsesGetAvailableExperimentVariableTypesResponseDC {
  types?: OrchExperimentVariableTypeDC[];
}

export interface ResponsesGetCompleteExperimentsResponseDC {
  additional_information?: string;
  config?: string;
  description?: string;
  id?: number;
  name?: string;
  project_id?: number;
  project_name?: string;
  rights?: AclRightDC[];
  status?: string;
}

export interface ResponsesGetCubeResponseDC {
  author?: string;
  base_cube?: DtoCubeDC;
  cube_params?: string;
  description?: string;
  id?: number;
  name?: string;
  params_name?: string;
  type?: DtoCubeTypeDC;
}

export interface ResponsesGetCurrentAppBannerResponseDC {
  app_banner?: DtoAppBannerDC;
}

export interface ResponsesGetDatasetLogResponseDC {
  act?: string;
  comment?: string;
  created_at?: string;
  details?: UpdateLogDatasetUpdateLogDC;
  id?: number;
  job_id?: number;
  name?: string;
  user?: string;
}

export interface ResponsesGetDatasetV2ResponseDC {
  id?: number;
  name?: string;
  params?: string;
  project_id?: number;
  project_name?: string;
  public?: boolean;
  rights?: AclRightDC[];
  schema?: string;
  type?: string;
}

export interface ResponsesGetExperimentAvailableDatasetsToLinkResponseDC {
  datasets?: DtoDatasetShortDC[];
  pages?: number;
  total?: number;
}

export interface ResponsesGetExperimentDatasetsResponseDC {
  datasets?: DtoExperimentDatasetDC[];
}

export interface ResponsesGetExperimentLogResponseDC {
  act?: string;
  comment?: string;
  created_at?: string;
  details?: UpdateLogExperimentUpdateLogDC;
  id?: number;
  job_id?: number;
  name?: string;
  user?: string;
}

export interface ResponsesGetExperimentURLsResponseDC {
  urls?: DtoExperimentURLDC[];
}

export interface ResponsesGetExperimentVariableResponseDC {
  variable?: DtoExperimentVariableDC;
}

export interface ResponsesGetExperimentVariablesResponseDC {
  variables?: DtoExperimentVariableShortDC[];
}

export interface ResponsesGetFormResponseDC {
  params?: ParamsParamDC[];
}

export interface ResponsesGetNamespaceConfigResponseDC {
  config?: DtoNamespaceConfigDC;
}

export interface ResponsesGetNamespaceLogResponseDC {
  act?: string;
  comment?: string;
  created_at?: string;
  details?: UpdateLogNamespaceUpdateLogDC;
  id?: number;
  name?: string;
  user?: string;
}

export interface ResponsesGetNamespaceResponseDC {
  config?: string;
  id?: number;
  name?: string;
  rights?: AclRightDC[];
}

export interface ResponsesGetProjectConfigResponseDC {
  config?: DtoProjectConfigDC;
}

export interface ResponsesGetProjectLogResponseDC {
  act?: string;
  comment?: string;
  created_at?: string;
  details?: UpdateLogProjectUpdateLogDC;
  id?: number;
  name?: string;
  user?: string;
}

export interface ResponsesGetProjectV2ResponseDC {
  config?: string;
  description?: string;
  id?: number;
  is_pinned?: boolean;
  name?: string;
  namespace_id?: number;
  namespace_name?: string;
  rights?: AclRightDC[];
}

export interface ResponsesGetProjectsURLSResponseDC {
  urls?: DtoProjectURLDC[];
}

export interface ResponsesGetSchemaResponseDC {
  config_schema?: string;
}

export interface ResponsesGetSupervisorConfigResponseDC {
  config?: string;
}

export interface ResponsesListAppBannersResponseDC {
  app_banners?: DtoAppBannerDC[];
}

export interface ResponsesListAppUpdatesResponseDC {
  app_updates?: DtoAppUpdateDC[];
  pages?: number;
  total?: number;
}

export interface ResponsesListCompleteExperimentsResponseDC {
  experiments?: DtoCompleteExperimentListDC[];
}

export interface ResponsesListCubesResponseDC {
  cubes?: DtoCubeDC[];
}

export interface ResponsesListDatasetUpdateLogsResponseDC {
  logs?: DtoDatasetUpdateLogDC[];
  pages?: number;
  total?: number;
}

export interface ResponsesListDatasetVersionsResponseDC {
  pages?: number;
  total?: number;
  versions?: DtoDatasetVersionDC[];
}

export interface ResponsesListDatasetsResponseDC {
  datasets?: DtoDatasetDC[];
}

export interface ResponsesListExperimentUpdateLogsResponseDC {
  logs?: DtoExperimentUpdateLogDC[];
  pages?: number;
  total?: number;
}

export interface ResponsesListExperimentVariableVersionsResponseDC {
  pages?: number;
  total?: number;
  versions?: DtoExperimentVariableVersionDC[];
}

export interface ResponsesListExperimentVersionsResponseDC {
  pages?: number;
  total?: number;
  versions?: DtoExperimentVersionDC[];
}

export interface ResponsesListJobsResponseDC {
  jobs?: ClientsJobDC[];
  pages?: number;
  total?: number;
}

export interface ResponsesListNamespaceConfigsResponseDC {
  configs?: DtoNamespaceConfigVersionDC[];
}

export interface ResponsesListNamespaceUpdateLogsResponseDC {
  logs?: DtoNamespaceUpdateLogDC[];
  pages?: number;
  total?: number;
}

export interface ResponsesListNamespacesResponseDC {
  can_create?: boolean;
  namespaces?: DtoNamespaceDC[];
}

export interface ResponsesListNamespacesV2ResponseDC {
  namespaces?: DtoNamespaceShortDC[];
}

export interface ResponsesListPinnedProjectsResponseDC {
  pinned_projects?: DtoPinnedProjectDC[];
}

export interface ResponsesListProjectConfigsResponseDC {
  configs?: DtoProjectConfigVersionDC[];
}

export interface ResponsesListProjectUpdateLogsResponseDC {
  logs?: DtoProjectUpdateLogDC[];
  pages?: number;
  total?: number;
}

export interface ResponsesListProjectsResponseDC {
  projects?: DtoProjectDC[];
}

export interface ResponsesListProjectsResponseV2DC {
  pages?: number;
  projects?: DtoProjectInfoDC[];
  total?: number;
}

export interface ResponsesListRolesResponseDC {
  roles?: DtoRoleDC[];
}

export interface ResponsesListRulesResponseDC {
  rules?: DtoRuleDC[];
}

export interface ResponsesListUserGroupMatchesResponseDC {
  rules?: DtoMatchedRuleDC[];
}

export interface ResponsesListUserGroupsResponseDC {
  user_groups?: DtoUserGroupDC[];
}

export interface ResponsesListUserMatchesResponseDC {
  rules?: DtoMatchedRuleDC[];
}

export interface ResponsesListUsersResponseDC {
  users?: DtoUserDC[];
}

export interface ResponsesSaveAppliedConfigResponseDC {
  saved?: number;
}

export interface ResponsesSearchDatasetsResponseDC {
  datasets?: DtoDatasetInfoDC[];
  pages?: number;
  total?: number;
}

export interface ResponsesUpdateAppAboutResponseDC {
  app_about?: DtoAppAboutDC;
}

export interface ResponsesUpdateAppBannerResponseDC {
  app_banner?: DtoAppBannerDC;
}

export interface ResponsesUpdateAppUpcomingResponseDC {
  app_upcoming?: DtoAppUpcomingDC;
}

export interface ResponsesUpdateAppUpdateResponseDC {
  app_update?: DtoAppUpdateDC;
}

export interface ResponsesUpdateCompleteExperimentResponseDC {
  additional_information?: string;
  config?: string;
  description?: string;
  id?: number;
  name?: string;
  project_id?: number;
  project_name?: string;
  status?: string;
}

export interface ResponsesUpdateCubeResponseDC {
  author?: string;
  base_cube?: DtoCubeDC;
  cube_params?: string;
  description?: string;
  id?: number;
  name?: string;
  params_name?: string;
  type?: DtoCubeTypeDC;
}

export interface ResponsesUpdateDatasetResponseDC {
  dataset?: DtoDatasetDC;
}

export interface ResponsesUpdateExperimentDatasetResponseDC {
  alias?: string;
  link_id?: number;
}

export interface ResponsesUpdateExperimentVariableResponseDC {
  variable?: DtoExperimentVariableDC;
}

export interface ResponsesUpdateNamespaceResponseDC {
  config?: string;
  id?: number;
  name?: string;
}

export interface ResponsesUpdateProjectResponseDC {
  project?: DtoProjectDC;
}

export interface ResponsesUserByNameResponseDC {
  id?: number;
  name?: string;
}

export interface ResponsesUserCapabilitiesDC {
  can_create_namespace?: boolean;
  can_manage_acl?: boolean;
  is_root?: boolean;
}

export interface ResponsesUserCapabilitiesResponseDC {
  capabilities?: ResponsesUserCapabilitiesDC;
}

export interface ResponsesUsersACLResponseDC {
  pages?: number;
  total?: number;
  users?: DtoUserRightsDC[];
}

export interface ResponsesValidationResponseDC {
  errors?: string;
  success?: boolean;
}

export type TokenListDataDC = DtoOAuthAccessTokenDC;

export type TokenListErrorDC = ResponsesErrorResponseDC;

export interface TokenListParamsDC {
  /** oauth code */
  code: string;
  /** oauth code */
  redirect_uri: string;
}

export interface UpdateLogDatasetDC {
  job_id?: number;
  name?: string;
  params?: string;
  public?: boolean;
  schema?: string;
  type?: string;
}

export interface UpdateLogDatasetUpdateLogDC {
  new?: UpdateLogDatasetDC;
  old?: UpdateLogDatasetDC;
}

export interface UpdateLogExperimentDC {
  config?: string;
  dataset_alias?: string;
  dataset_id?: number;
  description?: string;
  job_id?: number;
  name?: string;
  variable_name?: string;
  variable_type?: string;
  variable_value?: string;
}

export interface UpdateLogExperimentUpdateLogDC {
  new?: UpdateLogExperimentDC;
  old?: UpdateLogExperimentDC;
}

export interface UpdateLogNamespaceDC {
  config?: string;
  config_version_id?: number;
  name?: string;
  variable_name?: string;
  variable_type?: string;
  variable_value?: string;
}

export interface UpdateLogNamespaceUpdateLogDC {
  new?: UpdateLogNamespaceDC;
  old?: UpdateLogNamespaceDC;
}

export interface UpdateLogProjectDC {
  config?: string;
  config_version_id?: number;
  description?: string;
  name?: string;
  variable_name?: string;
  variable_type?: string;
  variable_value?: string;
}

export interface UpdateLogProjectUpdateLogDC {
  new?: UpdateLogProjectDC;
  old?: UpdateLogProjectDC;
}

export type V1AppAboutListDataDC = ResponsesGetAppAboutResponseDC;

export type V1AppAboutListErrorDC = ResponsesErrorResponseDC;

export type V1AppAboutUpdateDataDC = ResponsesUpdateAppAboutResponseDC;

export type V1AppAboutUpdateErrorDC = ResponsesErrorResponseDC;

export type V1AppBannerCreateDataDC = ResponsesCreateAppBannerResponseDC;

export type V1AppBannerCreateErrorDC = ResponsesErrorResponseDC;

export type V1AppBannerDeleteDataDC = any;

export type V1AppBannerDeleteErrorDC = ResponsesErrorResponseDC;

export type V1AppBannerListDataDC = ResponsesGetAppBannerResponseDC;

export type V1AppBannerListErrorDC = ResponsesErrorResponseDC;

export interface V1AppBannerListParamsDC {
  /** banner_id */
  banner_id: number;
}

export type V1AppBannerTypesListDataDC = ResponsesGetAvailableBannerTypesResponseDC;

export type V1AppBannerTypesListErrorDC = ResponsesErrorResponseDC;

export type V1AppBannerUpdateDataDC = ResponsesUpdateAppBannerResponseDC;

export type V1AppBannerUpdateErrorDC = ResponsesErrorResponseDC;

export type V1AppBannersCurrentListDataDC = ResponsesGetCurrentAppBannerResponseDC;

export type V1AppBannersCurrentListErrorDC = ResponsesErrorResponseDC;

export type V1AppBannersListDataDC = ResponsesListAppBannersResponseDC;

export type V1AppBannersListErrorDC = ResponsesErrorResponseDC;

export type V1AppIsAdminListDataDC = ResponsesGetAppIsAdminResponseDC;

export type V1AppIsAdminListErrorDC = ResponsesErrorResponseDC;

export type V1AppUpcomingListDataDC = ResponsesGetAppUpcomingResponseDC;

export type V1AppUpcomingListErrorDC = ResponsesErrorResponseDC;

export type V1AppUpcomingUpdateDataDC = ResponsesUpdateAppUpcomingResponseDC;

export type V1AppUpcomingUpdateErrorDC = ResponsesErrorResponseDC;

export type V1AppUpdateCreateDataDC = ResponsesCreateAppUpdateResponseDC;

export type V1AppUpdateCreateErrorDC = ResponsesErrorResponseDC;

export type V1AppUpdateDeleteDataDC = any;

export type V1AppUpdateDeleteErrorDC = ResponsesErrorResponseDC;

export type V1AppUpdateListDataDC = ResponsesGetAppUpdateResponseDC;

export type V1AppUpdateListErrorDC = ResponsesErrorResponseDC;

export interface V1AppUpdateListParamsDC {
  /** update_id */
  update_id: number;
}

export type V1AppUpdateUpdateDataDC = ResponsesUpdateAppUpdateResponseDC;

export type V1AppUpdateUpdateErrorDC = ResponsesErrorResponseDC;

export type V1AppUpdatesListDataDC = ResponsesListAppUpdatesResponseDC;

export type V1AppUpdatesListErrorDC = ResponsesErrorResponseDC;

export interface V1AppUpdatesListParamsDC {
  /** limit */
  limit?: number;
  /** offset */
  offset?: number;
}

export type V1CubeListDataDC = ResponsesGetCubeResponseDC;

export interface V1CubeListParamsDC {
  /** cube id */
  cube_id: number;
}

export type V1CubeNameListDataDC = ResponsesGetCubeResponseDC;

export interface V1CubeNameListParamsDC {
  /** cube name */
  name: string;
}

export type V1CubeSystemCreateDataDC = ResponsesCreateCubeResponseDC;

export type V1CubeSystemCreateErrorDC = ResponsesErrorResponseDC;

export type V1CubeUpdateDataDC = ResponsesUpdateCubeResponseDC;

export type V1CubesByIdsListDataDC = ResponsesListCubesResponseDC;

export interface V1CubesByIdsListParamsDC {
  /** cubes ids */
  ids: number[];
}

export type V1CubesListDataDC = ResponsesListCubesResponseDC;

export type V1DatasetApplyCreateDataDC = ResponsesEmptyResponseDC;

export type V1DatasetApplyCreateErrorDC = ResponsesErrorResponseDC;

export type V1DatasetDeleteDataDC = any;

export type V1DatasetDeleteErrorDC = ResponsesErrorResponseDC;

export type V1DatasetLogListDataDC = ResponsesGetDatasetLogResponseDC;

export type V1DatasetLogListErrorDC = ResponsesErrorResponseDC;

export interface V1DatasetLogListParamsDC {
  /** log id */
  log_id: number;
}

export type V1DatasetLogUpdateDataDC = any;

export type V1DatasetLogsListDataDC = ResponsesListDatasetUpdateLogsResponseDC;

export type V1DatasetLogsListErrorDC = ResponsesErrorResponseDC;

export interface V1DatasetLogsListParamsDC {
  /** dataset id */
  dataset_id?: number;
  /** from */
  from: number;
  /** limit */
  limit: number;
  /** namespace id */
  namespace_id?: number;
}

export type V1DisclaimCreateDataDC = ResponsesEmptyResponseDC;

export type V1DisclaimCreateErrorDC = ResponsesErrorResponseDC;

export type V1EventsListDataDC = ClientsListAllEventsResponseDC;

export type V1EventsListErrorDC = ResponsesErrorResponseDC;

export interface V1EventsListParamsDC {
  /** Filter by entity ID */
  entity_id?: number;
  /** Filter by entity type (experiment, dataset, project, namespace) */
  entity_type?: string;
  /** Filter by event type */
  event_type?: string;
  /** Filter by Job ID */
  job_id?: number;
  /** Filter by job type */
  job_type?: string;
  /** Limit (default 50, max 200) */
  limit?: number;
  /** Offset (default 0) */
  offset?: number;
  /** Sort order (asc, desc) */
  order?: string;
  /** Sort field (timestamp, event_type, job_id) */
  sort?: string;
}

export type V1ExperimentConfigApplySaveCreateDataDC = ResponsesSaveAppliedConfigResponseDC;

export type V1ExperimentConfigApplySaveCreateErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentConfigApplyUpdateDataDC = ResponsesEmptyResponseDC;

export type V1ExperimentConfigApplyUpdateErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentCopyCreateDataDC = ResponsesCopyCompleteExperimentResponseDC;

export type V1ExperimentCopyCreateErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentCreateDataDC = ResponsesCreateCompleteExperimentResponseDC;

export type V1ExperimentCreateErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentDatasetCreateDataDC = ResponsesAddDatasetToExperimentResponseDC;

export type V1ExperimentDatasetCreateErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentDatasetDeleteDataDC = ResponsesEmptyResponseDC;

export type V1ExperimentDatasetDeleteErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentDatasetUpdateDataDC = ResponsesUpdateExperimentDatasetResponseDC;

export type V1ExperimentDatasetUpdateErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentDatasetsListDataDC = ResponsesGetExperimentDatasetsResponseDC;

export type V1ExperimentDatasetsListErrorDC = ResponsesErrorResponseDC | ResponsesCreateAppBannerResponseDC;

export interface V1ExperimentDatasetsListParamsDC {
  /** experiment id */
  experiment_id: number;
}

export type V1ExperimentDeleteDataDC = any;

export type V1ExperimentDeleteErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentGrafanaUrlListDataDC = DtoExperimentURLDC;

export type V1ExperimentGrafanaUrlListErrorDC = ResponsesErrorResponseDC | ResponsesCreateAppBannerResponseDC;

export interface V1ExperimentGrafanaUrlListParamsDC {
  /** experiment id */
  experiment_id: number;
}

export type V1ExperimentListDataDC = ResponsesGetCompleteExperimentsResponseDC;

export type V1ExperimentListErrorDC = ResponsesErrorResponseDC;

export interface V1ExperimentListParamsDC {
  /** experiment_id */
  experiment_id: number;
}

export type V1ExperimentLogListDataDC = ResponsesGetExperimentLogResponseDC;

export type V1ExperimentLogListErrorDC = ResponsesErrorResponseDC;

export interface V1ExperimentLogListParamsDC {
  /** log id */
  log_id: number;
}

export type V1ExperimentLogUpdateDataDC = any;

export type V1ExperimentLogUpdateErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentLogsListDataDC = ResponsesListExperimentUpdateLogsResponseDC;

export type V1ExperimentLogsListErrorDC = ResponsesErrorResponseDC;

export interface V1ExperimentLogsListParamsDC {
  /** experiment id */
  experiment_id?: number;
  /** from */
  from: number;
  /** limit */
  limit: number;
  /** project id */
  project_id?: number;
}

export type V1ExperimentStartUpdateDataDC = ResponsesEmptyResponseDC;

export type V1ExperimentStartUpdateErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentStatusListDataDC = ResponsesExperimentStatusResponseDC;

export type V1ExperimentStatusListErrorDC = ResponsesErrorResponseDC | ResponsesCreateAppBannerResponseDC;

export interface V1ExperimentStatusListParamsDC {
  /** experiment id */
  experiment_id: number;
}

export type V1ExperimentStopUpdateDataDC = ResponsesEmptyResponseDC;

export type V1ExperimentStopUpdateErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentSupervisorListDataDC = ResponsesGetSupervisorConfigResponseDC;

export type V1ExperimentSupervisorListErrorDC = ResponsesErrorResponseDC | ResponsesCreateAppBannerResponseDC;

export interface V1ExperimentSupervisorListParamsDC {
  /** experiment id */
  experiment_id: number;
}

export type V1ExperimentUpdateDataDC = ResponsesUpdateCompleteExperimentResponseDC;

export type V1ExperimentUpdateErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentUpdatesListDataDC = ResponsesCheckExperimentUpdateResponseDC;

export type V1ExperimentUpdatesListErrorDC = ResponsesErrorResponseDC | ResponsesCreateAppBannerResponseDC;

export interface V1ExperimentUpdatesListParamsDC {
  /** experiment id */
  experiment_id: number;
}

export type V1ExperimentUrlsListDataDC = ResponsesGetExperimentURLsResponseDC;

export type V1ExperimentUrlsListErrorDC = ResponsesErrorResponseDC | ResponsesCreateAppBannerResponseDC;

export interface V1ExperimentUrlsListParamsDC {
  /** experiment id */
  experiment_id: number;
}

export type V1ExperimentValidationsFastCreateDataDC = DtoValidationResponseDC;

export type V1ExperimentValidationsFastCreateErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentValidationsRunCreateDataDC = DtoValidationResponseWithRunDC;

export type V1ExperimentValidationsRunCreateErrorDC = DtoValidationErrorResponseDC;

export type V1ExperimentVariableCreateDataDC = ResponsesCreateExperimentVariableResponseDC;

export type V1ExperimentVariableCreateErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentVariableDeleteDataDC = ResponsesEmptyResponseDC;

export type V1ExperimentVariableDeleteErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentVariableListDataDC = ResponsesGetExperimentVariableResponseDC;

export type V1ExperimentVariableListErrorDC = ResponsesErrorResponseDC | ResponsesCreateAppBannerResponseDC;

export interface V1ExperimentVariableListParamsDC {
  /** variable id */
  variable_id: number;
}

export type V1ExperimentVariableUpdateDataDC = ResponsesUpdateExperimentVariableResponseDC;

export type V1ExperimentVariableUpdateErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentVariablesListDataDC = ResponsesGetExperimentVariablesResponseDC;

export type V1ExperimentVariablesListErrorDC = ResponsesErrorResponseDC | ResponsesCreateAppBannerResponseDC;

export interface V1ExperimentVariablesListParamsDC {
  /** experiment id */
  experiment_id: number;
}

export type V1ExperimentVariablesTypesListDataDC = ResponsesGetAvailableExperimentVariableTypesResponseDC;

export type V1ExperimentVariablesTypesListErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentVersionCurrentListDataDC = ResponsesCurrentExperimentVersionResponseDC;

export type V1ExperimentVersionCurrentListErrorDC = ResponsesErrorResponseDC;

export interface V1ExperimentVersionCurrentListParamsDC {
  /** experiment id */
  experiment_id: number;
}

export type V1ExperimentVersionCurrentUpdateDataDC = ResponsesCurrentExperimentVersionResponseDC;

export type V1ExperimentVersionCurrentUpdateErrorDC = ResponsesErrorResponseDC;

export type V1ExperimentVersionListDataDC = DtoExperimentTemplateDC;

export type V1ExperimentVersionListErrorDC = ResponsesErrorResponseDC;

export interface V1ExperimentVersionListParamsDC {
  /** experiment id */
  experiment_id: number;
  /** config version id */
  version_id: number;
}

export type V1ExperimentVersionsListDataDC = ResponsesListExperimentVersionsResponseDC;

export type V1ExperimentVersionsListErrorDC = ResponsesErrorResponseDC;

export interface V1ExperimentVersionsListParamsDC {
  /** experiment id */
  experiment_id: number;
  /** from */
  from: number;
  /** limit */
  limit: number;
}

export type V1ExperimentsListDataDC = ResponsesListCompleteExperimentsResponseDC;

export type V1ExperimentsListErrorDC = ResponsesErrorResponseDC;

export interface V1ExperimentsListParamsDC {
  /** project id */
  project_id: number;
}

export type V1GrantCreateDataDC = ResponsesEmptyResponseDC;

export type V1GrantCreateErrorDC = ResponsesErrorResponseDC;

export type V1GraphListDataDC = PrivateGetProjectGraphResponseDC;

export type V1GraphListErrorDC = ResponsesErrorResponseDC;

export interface V1GraphListParamsDC {
  /** project id */
  project_id: number;
}

export type V1JobEventsListDataDC = ClientsListEventsResponseDC;

export type V1JobEventsListErrorDC = ResponsesErrorResponseDC;

export interface V1JobEventsListParamsDC {
  /** Event type filter */
  event_type?: string;
  /** Job ID */
  job_id: number;
  /** Limit */
  limit?: number;
  /** Offset */
  offset?: number;
}

export type V1JobListDataDC = ClientsGetJobResponseDC;

export type V1JobListErrorDC = ResponsesErrorResponseDC;

export interface V1JobListParamsDC {
  /** Job ID */
  job_id: number;
}

export type V1JobTasksListDataDC = ClientsListTasksResponseDC;

export type V1JobTasksListErrorDC = ResponsesErrorResponseDC;

export interface V1JobTasksListParamsDC {
  /** Job ID */
  job_id: number;
  /** Task status filter */
  status?: string;
}

export type V1JobsSearchCreateDataDC = ResponsesListJobsResponseDC;

export type V1JobsSearchCreateErrorDC = ResponsesErrorResponseDC;

export type V1NamespaceConfigListDataDC = ResponsesGetNamespaceConfigResponseDC;

export type V1NamespaceConfigListErrorDC = ResponsesErrorResponseDC;

export interface V1NamespaceConfigListParamsDC {
  /** config id */
  config_id: number;
}

export type V1NamespaceConfigsListDataDC = ResponsesListNamespaceConfigsResponseDC;

export type V1NamespaceConfigsListErrorDC = ResponsesErrorResponseDC;

export interface V1NamespaceConfigsListParamsDC {
  /** namespace id */
  namespace_id: number;
}

export type V1NamespaceCreateDataDC = ResponsesCreateNamespaceResponseDC;

export type V1NamespaceCreateErrorDC = ResponsesErrorResponseDC;

export type V1NamespaceDeleteDataDC = ResponsesEmptyResponseDC;

export type V1NamespaceDeleteErrorDC = ResponsesErrorResponseDC;

export type V1NamespaceListDataDC = ResponsesGetNamespaceResponseDC;

export type V1NamespaceListErrorDC = ResponsesErrorResponseDC;

export interface V1NamespaceListParamsDC {
  /** namespace id */
  namespace_id: number;
}

export type V1NamespaceLogListDataDC = ResponsesGetNamespaceLogResponseDC;

export type V1NamespaceLogListErrorDC = ResponsesErrorResponseDC;

export interface V1NamespaceLogListParamsDC {
  /** log id */
  log_id: number;
}

export type V1NamespaceLogUpdateDataDC = any;

export type V1NamespaceLogUpdateErrorDC = ResponsesErrorResponseDC;

export type V1NamespaceLogsListDataDC = ResponsesListNamespaceUpdateLogsResponseDC;

export type V1NamespaceLogsListErrorDC = ResponsesErrorResponseDC;

export interface V1NamespaceLogsListParamsDC {
  /** from */
  from: number;
  /** limit */
  limit: number;
  /** namespace id */
  namespace_id?: number;
}

export type V1NamespaceUpdateDataDC = ResponsesUpdateNamespaceResponseDC;

export type V1NamespaceUpdateErrorDC = ResponsesErrorResponseDC;

export type V1NamespacesListDataDC = ResponsesListNamespacesResponseDC;

export type V1NamespacesListErrorDC = ResponsesErrorResponseDC;

export type V1PermissionsListDataDC = ResponsesCheckPermissionsResponseDC;

export type V1PermissionsListErrorDC = ResponsesErrorResponseDC;

export interface V1PermissionsListParamsDC {
  /** scope */
  scope: string;
  /** user id */
  user_id: number;
}

export type V1PingListDataDC = PrivatePingResponseDC;

export type V1PingListErrorDC = ResponsesErrorResponseDC | ResponsesCreateAppBannerResponseDC;

export type V1ProjectConfigListDataDC = ResponsesGetProjectConfigResponseDC;

export interface V1ProjectConfigListParamsDC {
  /** config id */
  config_id: number;
}

export type V1ProjectConfigsListDataDC = ResponsesListProjectConfigsResponseDC;

export type V1ProjectConfigsListErrorDC = ResponsesErrorResponseDC;

export interface V1ProjectConfigsListParamsDC {
  /** project id */
  project_id: number;
}

export type V1ProjectCreateDataDC = ResponsesCreateProjectResponseDC;

export type V1ProjectCreateErrorDC = ResponsesErrorResponseDC;

export type V1ProjectDeleteDataDC = any;

export type V1ProjectDeleteErrorDC = ResponsesErrorResponseDC;

export type V1ProjectLogListDataDC = ResponsesGetProjectLogResponseDC;

export type V1ProjectLogListErrorDC = ResponsesErrorResponseDC;

export interface V1ProjectLogListParamsDC {
  /** log id */
  log_id: number;
}

export type V1ProjectLogUpdateDataDC = any;

export type V1ProjectLogUpdateErrorDC = ResponsesErrorResponseDC;

export type V1ProjectLogsListDataDC = ResponsesListProjectUpdateLogsResponseDC;

export type V1ProjectLogsListErrorDC = ResponsesErrorResponseDC;

export interface V1ProjectLogsListParamsDC {
  /** from */
  from: number;
  /** limit */
  limit: number;
  /** namespace id */
  namespace_id?: number;
  /** project id */
  project_id?: number;
}

export type V1ProjectUpdateDataDC = ResponsesUpdateProjectResponseDC;

export type V1ProjectUpdateErrorDC = ResponsesErrorResponseDC;

export type V1ProjectsListDataDC = ResponsesListProjectsResponseDC;

export type V1ProjectsListErrorDC = ResponsesErrorResponseDC;

export interface V1ProjectsListParamsDC {
  /** namespace id */
  namespace_id: number;
}

export type V1RoleCreateDataDC = ResponsesCreateRoleResponseDC;

export type V1RoleCreateErrorDC = ResponsesErrorResponseDC;

export type V1RoleRuleCreateDataDC = ResponsesEmptyResponseDC;

export type V1RoleRuleCreateErrorDC = ResponsesErrorResponseDC;

export type V1RoleRuleDeleteDataDC = ResponsesEmptyResponseDC;

export type V1RoleRuleDeleteErrorDC = ResponsesErrorResponseDC;

export type V1RoleUpdateDataDC = any;

export type V1RoleUpdateErrorDC = ResponsesErrorResponseDC;

export type V1RolesListDataDC = ResponsesListRulesResponseDC;

export type V1RolesListErrorDC = ResponsesErrorResponseDC;

export type V1RuleCreateDataDC = ResponsesCreateRuleResponseDC;

export type V1RuleCreateErrorDC = ResponsesErrorResponseDC;

export type V1RulesListDataDC = ResponsesListRulesResponseDC;

export type V1RulesListErrorDC = ResponsesErrorResponseDC;

export interface V1RulesListParamsDC {
  /** role id */
  role_id: number;
}

export type V1UserCreateDataDC = ResponsesCreateUserResponseDC;

export type V1UserCreateErrorDC = ResponsesErrorResponseDC;

export type V1UserGroupMatchesListDataDC = ResponsesListUserGroupMatchesResponseDC;

export type V1UserGroupMatchesListErrorDC = ResponsesErrorResponseDC;

export interface V1UserGroupMatchesListParamsDC {
  /** user group id */
  user_group_id: number;
}

export type V1UserListDataDC = ResponsesUserByNameResponseDC;

export type V1UserListErrorDC = ResponsesErrorResponseDC;

export interface V1UserListParamsDC {
  /** name */
  name: string;
}

export type V1UserMatchesListDataDC = ResponsesListUserMatchesResponseDC;

export type V1UserMatchesListErrorDC = ResponsesErrorResponseDC;

export interface V1UserMatchesListParamsDC {
  /** user id */
  user_id: number;
}

export type V1UsergroupCreateDataDC = ResponsesCreateUserGroupResponseDC;

export type V1UsergroupCreateErrorDC = ResponsesErrorResponseDC;

export type V1UsergroupUpdateDataDC = any;

export type V1UsergroupUpdateErrorDC = ResponsesErrorResponseDC;

export type V1UsergroupUserCreateDataDC = ResponsesEmptyResponseDC;

export type V1UsergroupUserCreateErrorDC = ResponsesErrorResponseDC;

export type V1UsergroupUserDeleteDataDC = ResponsesEmptyResponseDC;

export type V1UsergroupUserDeleteErrorDC = ResponsesErrorResponseDC;

export type V1UsergroupsListDataDC = ResponsesListUserGroupsResponseDC;

export type V1UsergroupsListErrorDC = ResponsesErrorResponseDC;

export type V1UsersListDataDC = ResponsesListUsersResponseDC;

export type V1UsersListErrorDC = ResponsesErrorResponseDC;

export interface V1UsersListParamsDC {
  /** user group id */
  user_group_id: number;
}

export type V1VersionListDataDC = PrivateVersionResponseDC;

export type V1VersionListErrorDC = ResponsesErrorResponseDC;

export type V1WhoAmIListDataDC = ResponsesUserByNameResponseDC;

export type V1WhoAmIListErrorDC = ResponsesErrorResponseDC;

export type V2AclCheckListDataDC = ResponsesCheckACLResponseDC;

export type V2AclCheckListErrorDC = ResponsesErrorResponseDC;

export interface V2AclCheckListParamsDC {
  /** object id */
  object_id: number;
  /** object type (experiment, dataset, project, namespace) */
  object_type: string;
}

export type V2AclUsersListDataDC = ResponsesUsersACLResponseDC;

export type V2AclUsersListErrorDC = ResponsesErrorResponseDC;

export interface V2AclUsersListParamsDC {
  /** limit */
  limit: number;
  /** object id */
  object_id: number;
  /** object type (experiment, dataset, project, namespace) */
  object_type: string;
  /** offset */
  offset: number;
  /** search */
  search?: string;
}

export type V2DatasetConfigValidateCreateDataDC = ResponsesValidationResponseDC;

export type V2DatasetConfigValidateCreateErrorDC = ResponsesErrorResponseDC;

export type V2DatasetCopyCreateDataDC = ResponsesCreateDatasetResponseDC;

export type V2DatasetCopyCreateErrorDC = ResponsesErrorResponseDC;

export type V2DatasetCreateDataDC = ResponsesCreateDatasetResponseDC;

export type V2DatasetCreateErrorDC = ResponsesErrorResponseDC;

export type V2DatasetLinksListDataDC = ResponsesDatasetExperimentLinksResponseDC;

export type V2DatasetLinksListErrorDC = ResponsesErrorResponseDC;

export interface V2DatasetLinksListParamsDC {
  /** dataset id */
  dataset_id: number;
  /** limit */
  limit: number;
  /** offset */
  offset: number;
}

export type V2DatasetListDataDC = ResponsesGetDatasetV2ResponseDC;

export type V2DatasetListErrorDC = ResponsesErrorResponseDC;

export interface V2DatasetListParamsDC {
  /** dataset id */
  dataset_id: number;
}

export type V2DatasetLogsListDataDC = ResponsesListDatasetUpdateLogsResponseDC;

export type V2DatasetLogsListErrorDC = ResponsesErrorResponseDC;

export interface V2DatasetLogsListParamsDC {
  /** dataset id */
  dataset_id?: number;
  /** from */
  from: number;
  /** limit */
  limit: number;
  /** project id */
  project_id?: number;
}

export type V2DatasetUpdateDataDC = ResponsesUpdateDatasetResponseDC;

export type V2DatasetUpdateErrorDC = ResponsesErrorResponseDC;

export type V2DatasetVersionCurrentListDataDC = ResponsesCurrentDatasetVersionResponseDC;

export type V2DatasetVersionCurrentListErrorDC = ResponsesErrorResponseDC;

export interface V2DatasetVersionCurrentListParamsDC {
  /** dataset id */
  dataset_id: number;
}

export type V2DatasetVersionCurrentUpdateDataDC = ResponsesUpdateDatasetResponseDC;

export type V2DatasetVersionCurrentUpdateErrorDC = ResponsesErrorResponseDC;

export type V2DatasetVersionListDataDC = DtoDatasetVersionTemplateDC;

export type V2DatasetVersionListErrorDC = ResponsesErrorResponseDC;

export interface V2DatasetVersionListParamsDC {
  /** version id */
  version_id: number;
}

export type V2DatasetVersionUpdateDataDC = DtoDatasetVersionTemplateDC;

export type V2DatasetVersionUpdateErrorDC = ResponsesErrorResponseDC;

export type V2DatasetVersionsListDataDC = ResponsesListDatasetVersionsResponseDC;

export type V2DatasetVersionsListErrorDC = ResponsesErrorResponseDC;

export interface V2DatasetVersionsListParamsDC {
  /** dataset id */
  dataset_id: number;
  /** from */
  from: number;
  /** limit */
  limit: number;
}

export type V2DatasetYtListErrorDC = ResponsesErrorResponseDC;

export interface V2DatasetYtListParamsDC {
  /** dataset id */
  dataset_id: number;
}

export type V2DatasetsClustersListDataDC = ResponsesGetAvailableDatasetClustersResponseDC;

export type V2DatasetsClustersListErrorDC = ResponsesErrorResponseDC;

export type V2DatasetsListDataDC = ResponsesListDatasetsResponseDC;

export type V2DatasetsListErrorDC = ResponsesErrorResponseDC | ResponsesCreateAppBannerResponseDC;

export interface V2DatasetsListParamsDC {
  /** project id */
  project_id: number;
}

export type V2DatasetsSearchCreateDataDC = ResponsesSearchDatasetsResponseDC;

export type V2DatasetsSearchCreateErrorDC = ResponsesErrorResponseDC;

export type V2ExperimentConfigApplyUpdateDataDC = ResponsesEmptyResponseDC;

export type V2ExperimentConfigApplyUpdateErrorDC = ResponsesErrorResponseDC;

export type V2ExperimentConfigValidateCreateDataDC = ResponsesValidationResponseDC;

export type V2ExperimentConfigValidateCreateErrorDC = ResponsesErrorResponseDC;

export type V2ExperimentSearchDatasetsCreateDataDC = ResponsesGetExperimentAvailableDatasetsToLinkResponseDC;

export type V2ExperimentSearchDatasetsCreateErrorDC = ResponsesErrorResponseDC;

export type V2ExperimentVariableVersionCurrentListDataDC = ResponsesCurrentExperimentVersionResponseDC;

export type V2ExperimentVariableVersionCurrentListErrorDC = ResponsesErrorResponseDC;

export interface V2ExperimentVariableVersionCurrentListParamsDC {
  /** variable id */
  variable_id: number;
}

export type V2ExperimentVariableVersionCurrentUpdateDataDC = ResponsesCurrentExperimentVersionResponseDC;

export type V2ExperimentVariableVersionCurrentUpdateErrorDC = ResponsesErrorResponseDC;

export type V2ExperimentVariableVersionListDataDC = DtoExperimentVariableVersionTemplateDC;

export interface V2ExperimentVariableVersionListParamsDC {
  /** version id */
  version_id: number;
}

export type V2ExperimentVariableVersionUpdateDataDC = DtoExperimentVariableVersionTemplateDC;

export type V2ExperimentVariableVersionUpdateErrorDC = ResponsesErrorResponseDC;

export type V2ExperimentVariableVersionsListDataDC = ResponsesListExperimentVariableVersionsResponseDC;

export type V2ExperimentVariableVersionsListErrorDC = ResponsesErrorResponseDC;

export interface V2ExperimentVariableVersionsListParamsDC {
  /** experiment id */
  experiment_id: number;
  /** from */
  from: number;
  /** limit */
  limit: number;
  /** variable id */
  variable_id?: number;
}

export type V2ExperimentVersionUpdateDataDC = DtoExperimentTemplateDC;

export type V2ExperimentVersionUpdateErrorDC = ResponsesErrorResponseDC;

export type V2FormsDatasetListDataDC = ResponsesGetFormResponseDC;

export type V2FormsDatasetListErrorDC = ResponsesErrorResponseDC;

export interface V2FormsDatasetListParamsDC {
  /** dataset type (json, kafka; legacy: Queue, KeyValue, StaticTableDir, Kafka) */
  type: string;
}

export type V2FormsExperimentListDataDC = ResponsesGetFormResponseDC;

export type V2FormsExperimentListErrorDC = ResponsesErrorResponseDC;

export type V2FormsProjectListDataDC = ResponsesGetFormResponseDC;

export type V2FormsProjectListErrorDC = ResponsesErrorResponseDC;

export type V2MeCapabilitiesListDataDC = ResponsesUserCapabilitiesResponseDC;

export type V2MeCapabilitiesListErrorDC = ResponsesErrorResponseDC;

export type V2NamespacesListDataDC = ResponsesListNamespacesV2ResponseDC;

export type V2NamespacesListErrorDC = ResponsesErrorResponseDC;

export type V2ProjectConfigValidateCreateDataDC = ResponsesValidationResponseDC;

export type V2ProjectConfigValidateCreateErrorDC = ResponsesErrorResponseDC;

export type V2ProjectListDataDC = ResponsesGetProjectV2ResponseDC;

export type V2ProjectListErrorDC = ResponsesErrorResponseDC;

export interface V2ProjectListParamsDC {
  /** project id */
  project_id: number;
}

export type V2ProjectPinnedCreateDataDC = ResponsesAddPinnedProjectResponseDC;

export type V2ProjectPinnedCreateErrorDC = ResponsesErrorResponseDC;

export type V2ProjectPinnedDeleteDataDC = any;

export type V2ProjectPinnedDeleteErrorDC = ResponsesErrorResponseDC;

export type V2ProjectUrlsListDataDC = ResponsesGetProjectsURLSResponseDC;

export type V2ProjectUrlsListErrorDC = ResponsesErrorResponseDC | ResponsesCreateAppBannerResponseDC;

export interface V2ProjectUrlsListParamsDC {
  /** project id */
  project_id: number;
}

export type V2ProjectsCreateDataDC = ResponsesListProjectsResponseV2DC;

export type V2ProjectsCreateErrorDC = ResponsesErrorResponseDC;

export type V2ProjectsPinnedListDataDC = ResponsesListPinnedProjectsResponseDC;

export type V2ProjectsPinnedListErrorDC = ResponsesErrorResponseDC;

export type V2SchemaListDataDC = ResponsesGetSchemaResponseDC;

export type V2SchemaListErrorDC = ResponsesErrorResponseDC;

export interface V2SchemaListParamsDC {
  /** config type */
  config_type: string;
}

export type V2UserRolesListDataDC = ResponsesListRolesResponseDC;

export type V2UserRolesListErrorDC = ResponsesErrorResponseDC;

export interface V2UserRolesListParamsDC {
  /** user id */
  user_id: number;
}

export type V3ExperimentConfigApplyUpdateDataDC = ResponsesEmptyResponseDC;

export type V3ExperimentConfigApplyUpdateErrorDC = ResponsesErrorResponseDC;

export type WhoAmIListDataDC = DtoUserInfoDC;

export type WhoAmIListErrorDC = ResponsesErrorResponseDC;
