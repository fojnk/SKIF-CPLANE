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

import { ContentType, RequestParams } from '@/shared/api/common/http-client';
import { apiUrl, http } from '@/shared/api/http';
import {
  RequestsAddDatasetToExperimentRequestDC,
  RequestsApplyExperimentConfigRequestDC,
  RequestsCompleteExperimentValidateRequestDC,
  RequestsCopyCompleteExperimentRequestDC,
  RequestsCreateCompleteExperimentRequestDC,
  RequestsCreateExperimentVariableRequestDC,
  RequestsDeleteCompleteExperimentRequestDC,
  RequestsDeleteExperimentVariableRequestDC,
  RequestsGetExperimentAvailableDatasetsToLinkRequestDC,
  RequestsExperimentStartRequestDC,
  RequestsExperimentStopRequestDC,
  RequestsExperimentValidateFastRequestDC,
  RequestsExperimentValidateRunRequestDC,
  RequestsRemoveDatasetFromExperimentRequestDC,
  RequestsSaveAppliedVersionForExperimentsRequestDC,
  RequestsUpdateCompleteExperimentRequestDC,
  RequestsUpdateExperimentConfigVersionRequestDC,
  RequestsUpdateExperimentDatasetRequestDC,
  RequestsUpdateExperimentLogCommentRequestDC,
  RequestsUpdateExperimentVariableRequestDC,
  RequestsUpdateExperimentVariableVersionCommentRequestDC,
  RequestsUpdateExperimentVariableVersionRequestDC,
  RequestsUpdateExperimentVersionCommentRequestDC,
  V1GraphListDataDC,
  V1GraphListErrorDC,
  V1GraphListParamsDC,
  V1ExperimentConfigApplySaveCreateDataDC,
  V1ExperimentConfigApplySaveCreateErrorDC,
  V1ExperimentConfigApplyUpdateDataDC,
  V1ExperimentConfigApplyUpdateErrorDC,
  V1ExperimentCopyCreateDataDC,
  V1ExperimentCopyCreateErrorDC,
  V1ExperimentCreateDataDC,
  V1ExperimentCreateErrorDC,
  V1ExperimentDatasetCreateDataDC,
  V1ExperimentDatasetCreateErrorDC,
  V1ExperimentDatasetDeleteDataDC,
  V1ExperimentDatasetDeleteErrorDC,
  V1ExperimentDatasetUpdateDataDC,
  V1ExperimentDatasetUpdateErrorDC,
  V1ExperimentDatasetsListDataDC,
  V1ExperimentDatasetsListErrorDC,
  V1ExperimentDatasetsListParamsDC,
  V1ExperimentDeleteDataDC,
  V1ExperimentDeleteErrorDC,
  V1ExperimentGrafanaUrlListDataDC,
  V1ExperimentGrafanaUrlListErrorDC,
  V1ExperimentGrafanaUrlListParamsDC,
  V1ExperimentListDataDC,
  V1ExperimentListErrorDC,
  V1ExperimentListParamsDC,
  V1ExperimentLogListDataDC,
  V1ExperimentLogListErrorDC,
  V1ExperimentLogListParamsDC,
  V1ExperimentLogUpdateDataDC,
  V1ExperimentLogUpdateErrorDC,
  V1ExperimentLogsListDataDC,
  V1ExperimentLogsListErrorDC,
  V1ExperimentLogsListParamsDC,
  V1ExperimentOrchestratorListDataDC,
  V1ExperimentOrchestratorListErrorDC,
  V1ExperimentOrchestratorListParamsDC,
  V1ExperimentStartUpdateDataDC,
  V1ExperimentStartUpdateErrorDC,
  V1ExperimentStatusListDataDC,
  V1ExperimentStatusListErrorDC,
  V1ExperimentStatusListParamsDC,
  V1ExperimentStopUpdateDataDC,
  V1ExperimentStopUpdateErrorDC,
  V1ExperimentUpdateDataDC,
  V1ExperimentUpdateErrorDC,
  V1ExperimentUpdatesListDataDC,
  V1ExperimentUpdatesListErrorDC,
  V1ExperimentUpdatesListParamsDC,
  V1ExperimentUrlsListDataDC,
  V1ExperimentUrlsListErrorDC,
  V1ExperimentUrlsListParamsDC,
  V1ExperimentValidationsFastCreateDataDC,
  V1ExperimentValidationsFastCreateErrorDC,
  V1ExperimentValidationsRunCreateDataDC,
  V1ExperimentValidationsRunCreateErrorDC,
  V1ExperimentVariableCreateDataDC,
  V1ExperimentVariableCreateErrorDC,
  V1ExperimentVariableDeleteDataDC,
  V1ExperimentVariableDeleteErrorDC,
  V1ExperimentVariableListDataDC,
  V1ExperimentVariableListErrorDC,
  V1ExperimentVariableListParamsDC,
  V1ExperimentVariableUpdateDataDC,
  V1ExperimentVariableUpdateErrorDC,
  V1ExperimentVariablesListDataDC,
  V1ExperimentVariablesListErrorDC,
  V1ExperimentVariablesListParamsDC,
  V1ExperimentVariablesTypesListDataDC,
  V1ExperimentVariablesTypesListErrorDC,
  V1ExperimentVersionCurrentListDataDC,
  V1ExperimentVersionCurrentListErrorDC,
  V1ExperimentVersionCurrentListParamsDC,
  V1ExperimentVersionCurrentUpdateDataDC,
  V1ExperimentVersionCurrentUpdateErrorDC,
  V1ExperimentVersionListDataDC,
  V1ExperimentVersionListErrorDC,
  V1ExperimentVersionListParamsDC,
  V1ExperimentVersionsListDataDC,
  V1ExperimentVersionsListErrorDC,
  V1ExperimentVersionsListParamsDC,
  V1ExperimentsListDataDC,
  V1ExperimentsListErrorDC,
  V1ExperimentsListParamsDC,
  V2ExperimentConfigApplyUpdateDataDC,
  V2ExperimentConfigApplyUpdateErrorDC,
  V2ExperimentConfigValidateCreateDataDC,
  V2ExperimentConfigValidateCreateErrorDC,
  V2ExperimentSearchDatasetsCreateDataDC,
  V2ExperimentSearchDatasetsCreateErrorDC,
  V2ExperimentVariableVersionCurrentListDataDC,
  V2ExperimentVariableVersionCurrentListErrorDC,
  V2ExperimentVariableVersionCurrentListParamsDC,
  V2ExperimentVariableVersionCurrentUpdateDataDC,
  V2ExperimentVariableVersionCurrentUpdateErrorDC,
  V2ExperimentVariableVersionListDataDC,
  V2ExperimentVariableVersionListParamsDC,
  V2ExperimentVariableVersionUpdateDataDC,
  V2ExperimentVariableVersionUpdateErrorDC,
  V2ExperimentVariableVersionsListDataDC,
  V2ExperimentVariableVersionsListErrorDC,
  V2ExperimentVariableVersionsListParamsDC,
  V2ExperimentVersionUpdateDataDC,
  V2ExperimentVersionUpdateErrorDC,
  V3ExperimentConfigApplyUpdateDataDC,
  V3ExperimentConfigApplyUpdateErrorDC,
} from './data-contracts';
export const experimentApi = new (class ExperimentApi {
  /**
   * No description
   *
   * @tags experiment
   * @summary get project graph
   * @request GET:/api/v1/graph
   * @responses <br/>
   *  **200** V1GraphListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1GraphList = (query: V1GraphListParamsDC, params: RequestParams = {}) =>
    http.request<V1GraphListDataDC, V1GraphListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/graph`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary save applied version for configs
   * @request POST:/api/v1/experiment/config/apply/save
   * @responses <br/>
   *  **200** V1ExperimentConfigApplySaveCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentConfigApplySaveCreate = (
    request: RequestsSaveAppliedVersionForExperimentsRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentConfigApplySaveCreateDataDC,
      V1ExperimentConfigApplySaveCreateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/config/apply/save`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary apply experiment config
   * @request PUT:/api/v1/experiment/config/apply
   * @responses <br/>
   *  **200** V1ExperimentConfigApplyUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentConfigApplyUpdate = (
    request: RequestsApplyExperimentConfigRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentConfigApplyUpdateDataDC,
      V1ExperimentConfigApplyUpdateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/config/apply`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary copy experiment
   * @request POST:/api/v1/experiment/copy
   * @responses <br/>
   *  **200** V1ExperimentCopyCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentCopyCreate = (
    request: RequestsCopyCompleteExperimentRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentCopyCreateDataDC, V1ExperimentCopyCreateErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/copy`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary create experiment
   * @request POST:/api/v1/experiment
   * @responses <br/>
   *  **200** V1ExperimentCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentCreate = (
    request: RequestsCreateCompleteExperimentRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentCreateDataDC, V1ExperimentCreateErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary add dataset to experiment
   * @request POST:/api/v1/experiment/dataset
   * @responses <br/>
   *  **200** V1ExperimentDatasetCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentDatasetCreate = (
    request: RequestsAddDatasetToExperimentRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentDatasetCreateDataDC,
      V1ExperimentDatasetCreateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/dataset`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary remove dataset from experiment
   * @request DELETE:/api/v1/experiment/dataset
   * @responses <br/>
   *  **200** V1ExperimentDatasetDeleteDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentDatasetDelete = (
    request: RequestsRemoveDatasetFromExperimentRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentDatasetDeleteDataDC,
      V1ExperimentDatasetDeleteErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/dataset`,
      method: 'DELETE',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary get experiment datasets
   * @request GET:/api/v1/experiment/datasets
   * @responses <br/>
   *  **200** V1ExperimentDatasetsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesCreateAppBannerResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentDatasetsList = (
    query: V1ExperimentDatasetsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentDatasetsListDataDC,
      V1ExperimentDatasetsListErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/datasets`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary update experiment dataset link
   * @request PUT:/api/v1/experiment/dataset
   * @responses <br/>
   *  **200** V1ExperimentDatasetUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentDatasetUpdate = (
    request: RequestsUpdateExperimentDatasetRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentDatasetUpdateDataDC,
      V1ExperimentDatasetUpdateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/dataset`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary delete experiment
   * @request DELETE:/api/v1/experiment
   * @responses <br/>
   *  **200** V1ExperimentDeleteDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentDelete = (
    request: RequestsDeleteCompleteExperimentRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentDeleteDataDC, V1ExperimentDeleteErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment`,
      method: 'DELETE',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary get experiment grafana url
   * @request GET:/api/v1/experiment/grafana_url
   * @responses <br/>
   *  **200** V1ExperimentGrafanaUrlListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesCreateAppBannerResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentGrafanaUrlList = (
    query: V1ExperimentGrafanaUrlListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentGrafanaUrlListDataDC,
      V1ExperimentGrafanaUrlListErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/grafana_url`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary get experiment info
   * @request GET:/api/v1/experiment
   * @responses <br/>
   *  **200** V1ExperimentListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentList = (
    query: V1ExperimentListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentListDataDC, V1ExperimentListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary get experiment update log
   * @request GET:/api/v1/experiment/log
   * @responses <br/>
   *  **200** V1ExperimentLogListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentLogList = (
    query: V1ExperimentLogListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentLogListDataDC, V1ExperimentLogListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/log`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary list experiment update logs
   * @request GET:/api/v1/experiment/logs
   * @responses <br/>
   *  **200** V1ExperimentLogsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentLogsList = (
    query: V1ExperimentLogsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentLogsListDataDC, V1ExperimentLogsListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/logs`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary update experiment log comment
   * @request PUT:/api/v1/experiment/log
   * @responses <br/>
   *  **200** V1ExperimentLogUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentLogUpdate = (
    request: RequestsUpdateExperimentLogCommentRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentLogUpdateDataDC, V1ExperimentLogUpdateErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/log`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary get orchestrator config
   * @request GET:/api/v1/experiment/orchestrator
   * @responses <br/>
   *  **200** V1ExperimentOrchestratorListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesCreateAppBannerResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentOrchestratorList = (
    query: V1ExperimentOrchestratorListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentOrchestratorListDataDC,
      V1ExperimentOrchestratorListErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/orchestrator`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary list experiments in project
   * @request GET:/api/v1/experiments
   * @responses <br/>
   *  **200** V1ExperimentsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentsList = (
    query: V1ExperimentsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentsListDataDC, V1ExperimentsListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiments`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary start experiment
   * @request PUT:/api/v1/experiment/start
   * @responses <br/>
   *  **200** V1ExperimentStartUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentStartUpdate = (
    request: RequestsExperimentStartRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentStartUpdateDataDC, V1ExperimentStartUpdateErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/start`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary get experiment status
   * @request GET:/api/v1/experiment/status
   * @responses <br/>
   *  **200** V1ExperimentStatusListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesCreateAppBannerResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentStatusList = (
    query: V1ExperimentStatusListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentStatusListDataDC, V1ExperimentStatusListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/status`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary stop experiment
   * @request PUT:/api/v1/experiment/stop
   * @responses <br/>
   *  **200** V1ExperimentStopUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentStopUpdate = (
    request: RequestsExperimentStopRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentStopUpdateDataDC, V1ExperimentStopUpdateErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/stop`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary update experiment
   * @request PUT:/api/v1/experiment
   * @responses <br/>
   *  **200** V1ExperimentUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentUpdate = (
    request: RequestsUpdateCompleteExperimentRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentUpdateDataDC, V1ExperimentUpdateErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary start experiment
   * @request GET:/api/v1/experiment/updates
   * @responses <br/>
   *  **200** V1ExperimentUpdatesListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **404** ResponsesCreateAppBannerResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentUpdatesList = (
    query: V1ExperimentUpdatesListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentUpdatesListDataDC, V1ExperimentUpdatesListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/updates`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary get experiment urls
   * @request GET:/api/v1/experiment/urls
   * @responses <br/>
   *  **200** V1ExperimentUrlsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesCreateAppBannerResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentUrlsList = (
    query: V1ExperimentUrlsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentUrlsListDataDC, V1ExperimentUrlsListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/urls`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary validate experiment config fast
   * @request POST:/api/v1/experiment/validations/fast
   * @responses <br/>
   *  **200** V1ExperimentValidationsFastCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentValidationsFastCreate = (
    request: RequestsExperimentValidateFastRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentValidationsFastCreateDataDC,
      V1ExperimentValidationsFastCreateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/validations/fast`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * @description Validates experiment configuration and runs it with provided datasets. Returns validation results with run outputs.
   *
   * @tags experiment
   * @summary validate experiment config with run
   * @request POST:/api/v1/experiment/validations/run
   * @responses <br/>
   *  **200** V1ExperimentValidationsRunCreateDataDC OK <br/>
   *  **400** DtoValidationErrorResponseDC Bad Request <br/>
   *  **401** DtoValidationErrorResponseDC Unauthorized <br/>
   *  **403** DtoValidationErrorResponseDC Forbidden <br/>
   *  **404** DtoValidationErrorResponseDC Not Found <br/>
   *  **500** DtoValidationErrorResponseDC Internal server error <br/>
   */
  v1ExperimentValidationsRunCreate = (
    request: RequestsExperimentValidateRunRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentValidationsRunCreateDataDC,
      V1ExperimentValidationsRunCreateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/validations/run`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary create experiment variable
   * @request POST:/api/v1/experiment/variable
   * @responses <br/>
   *  **200** V1ExperimentVariableCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentVariableCreate = (
    request: RequestsCreateExperimentVariableRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentVariableCreateDataDC,
      V1ExperimentVariableCreateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/variable`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary delete experiment variable
   * @request DELETE:/api/v1/experiment/variable
   * @responses <br/>
   *  **200** V1ExperimentVariableDeleteDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentVariableDelete = (
    request: RequestsDeleteExperimentVariableRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentVariableDeleteDataDC,
      V1ExperimentVariableDeleteErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/variable`,
      method: 'DELETE',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary get experiment variable
   * @request GET:/api/v1/experiment/variable
   * @responses <br/>
   *  **200** V1ExperimentVariableListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesCreateAppBannerResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentVariableList = (
    query: V1ExperimentVariableListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentVariableListDataDC, V1ExperimentVariableListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/variable`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary get experiment variables
   * @request GET:/api/v1/experiment/variables
   * @responses <br/>
   *  **200** V1ExperimentVariablesListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesCreateAppBannerResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentVariablesList = (
    query: V1ExperimentVariablesListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentVariablesListDataDC, V1ExperimentVariablesListErrorDC>(
      {
        path: `${
          buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
        }/api/v1/experiment/variables`,
        method: 'GET',
        query: query,
        type: ContentType.Json,
        ...params,
      },
    );
  /**
   * No description
   *
   * @tags experiment
   * @summary get available experiment variable types
   * @request GET:/api/v1/experiment/variables/types
   * @responses <br/>
   *  **200** V1ExperimentVariablesTypesListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentVariablesTypesList = (params: RequestParams = {}) =>
    http.request<
      V1ExperimentVariablesTypesListDataDC,
      V1ExperimentVariablesTypesListErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/variables/types`,
      method: 'GET',
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary update experiment variable
   * @request PUT:/api/v1/experiment/variable
   * @responses <br/>
   *  **200** V1ExperimentVariableUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentVariableUpdate = (
    request: RequestsUpdateExperimentVariableRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentVariableUpdateDataDC,
      V1ExperimentVariableUpdateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/variable`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary get experiment current config version
   * @request GET:/api/v1/experiment/version/current
   * @responses <br/>
   *  **200** V1ExperimentVersionCurrentListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentVersionCurrentList = (
    query: V1ExperimentVersionCurrentListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentVersionCurrentListDataDC,
      V1ExperimentVersionCurrentListErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/version/current`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary update version of experiment, you can back to the previous versions
   * @request PUT:/api/v1/experiment/version/current
   * @responses <br/>
   *  **200** V1ExperimentVersionCurrentUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentVersionCurrentUpdate = (
    request: RequestsUpdateExperimentConfigVersionRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V1ExperimentVersionCurrentUpdateDataDC,
      V1ExperimentVersionCurrentUpdateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/version/current`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary get experiment config by version
   * @request GET:/api/v1/experiment/version
   * @responses <br/>
   *  **200** V1ExperimentVersionListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentVersionList = (
    query: V1ExperimentVersionListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentVersionListDataDC, V1ExperimentVersionListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/version`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary list experiment versions
   * @request GET:/api/v1/experiment/versions
   * @responses <br/>
   *  **200** V1ExperimentVersionsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ExperimentVersionsList = (
    query: V1ExperimentVersionsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1ExperimentVersionsListDataDC, V1ExperimentVersionsListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/experiment/versions`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary apply experiment config (v2 - uses jobd)
   * @request PUT:/api/v2/experiment/config/apply
   * @responses <br/>
   *  **200** V2ExperimentConfigApplyUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentConfigApplyUpdate = (
    request: RequestsApplyExperimentConfigRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2ExperimentConfigApplyUpdateDataDC,
      V2ExperimentConfigApplyUpdateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/config/apply`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary validate experiment config
   * @request POST:/api/v2/experiment/config/validate
   * @responses <br/>
   *  **200** V2ExperimentConfigValidateCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentConfigValidateCreate = (
    request: RequestsCompleteExperimentValidateRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2ExperimentConfigValidateCreateDataDC,
      V2ExperimentConfigValidateCreateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/config/validate`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary get experiment datasets available to link
   * @request POST:/api/v2/experiment/search/datasets
   * @responses <br/>
   *  **200** V2ExperimentSearchDatasetsCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentSearchDatasetsCreate = (
    request: RequestsGetExperimentAvailableDatasetsToLinkRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2ExperimentSearchDatasetsCreateDataDC,
      V2ExperimentSearchDatasetsCreateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/search/datasets`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary get experiment variable current version
   * @request GET:/api/v2/experiment/variable/version/current
   * @responses <br/>
   *  **200** V2ExperimentVariableVersionCurrentListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentVariableVersionCurrentList = (
    query: V2ExperimentVariableVersionCurrentListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2ExperimentVariableVersionCurrentListDataDC,
      V2ExperimentVariableVersionCurrentListErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/variable/version/current`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary update version of experiment, you can back to the previous versions
   * @request PUT:/api/v2/experiment/variable/version/current
   * @responses <br/>
   *  **200** V2ExperimentVariableVersionCurrentUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentVariableVersionCurrentUpdate = (
    request: RequestsUpdateExperimentVariableVersionRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2ExperimentVariableVersionCurrentUpdateDataDC,
      V2ExperimentVariableVersionCurrentUpdateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/variable/version/current`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary get experiment config by version
   * @request GET:/api/v2/experiment/variable/version
   * @responses <br/>
   *  **200** V2ExperimentVariableVersionListDataDC OK <br/>
   */
  v2ExperimentVariableVersionList = (
    query: V2ExperimentVariableVersionListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V2ExperimentVariableVersionListDataDC, any>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/variable/version`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary list experiment variable versions
   * @request GET:/api/v2/experiment/variable/versions
   * @responses <br/>
   *  **200** V2ExperimentVariableVersionsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentVariableVersionsList = (
    query: V2ExperimentVariableVersionsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2ExperimentVariableVersionsListDataDC,
      V2ExperimentVariableVersionsListErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/variable/versions`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary update experiment version comment
   * @request PUT:/api/v2/experiment/variable/version
   * @responses <br/>
   *  **200** V2ExperimentVariableVersionUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentVariableVersionUpdate = (
    request: RequestsUpdateExperimentVariableVersionCommentRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2ExperimentVariableVersionUpdateDataDC,
      V2ExperimentVariableVersionUpdateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/variable/version`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags experiment
   * @summary update experiment version comment
   * @request PUT:/api/v2/experiment/version
   * @responses <br/>
   *  **200** V2ExperimentVersionUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentVersionUpdate = (
    request: RequestsUpdateExperimentVersionCommentRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V2ExperimentVersionUpdateDataDC, V2ExperimentVersionUpdateErrorDC>(
      {
        path: `${
          buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
        }/api/v2/experiment/version`,
        method: 'PUT',
        body: request,
        type: ContentType.Json,
        ...params,
      },
    );
  /**
   * No description
   *
   * @tags experiment
   * @summary apply experiment config (v3 - supports both single stage and phased apply via jobd)
   * @request PUT:/api/v3/experiment/config/apply
   * @responses <br/>
   *  **200** V3ExperimentConfigApplyUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v3ExperimentConfigApplyUpdate = (
    request: RequestsApplyExperimentConfigRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V3ExperimentConfigApplyUpdateDataDC,
      V3ExperimentConfigApplyUpdateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v3/experiment/config/apply`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
})();
