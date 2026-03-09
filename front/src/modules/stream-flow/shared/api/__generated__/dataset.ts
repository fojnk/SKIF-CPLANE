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
  RequestsApplyDatasetRequestDC,
  RequestsCopyDatasetRequestV2DC,
  RequestsCreateDatasetRequestV2DC,
  RequestsDatasetValidateRequestDC,
  RequestsDeleteDatasetRequestDC,
  RequestsSearchDatasetsRequestDC,
  RequestsUpdateDatasetLogCommentRequestDC,
  RequestsUpdateDatasetRequestV2DC,
  RequestsUpdateDatasetVersionCommentRequestDC,
  RequestsUpdateDatasetVersionRequestDC,
  V1DatasetApplyCreateDataDC,
  V1DatasetApplyCreateErrorDC,
  V1DatasetDeleteDataDC,
  V1DatasetDeleteErrorDC,
  V1DatasetLogListDataDC,
  V1DatasetLogListErrorDC,
  V1DatasetLogListParamsDC,
  V1DatasetLogUpdateDataDC,
  V1DatasetLogsListDataDC,
  V1DatasetLogsListErrorDC,
  V1DatasetLogsListParamsDC,
  V2DatasetConfigValidateCreateDataDC,
  V2DatasetConfigValidateCreateErrorDC,
  V2DatasetCopyCreateDataDC,
  V2DatasetCopyCreateErrorDC,
  V2DatasetCreateDataDC,
  V2DatasetCreateErrorDC,
  V2DatasetLinksListDataDC,
  V2DatasetLinksListErrorDC,
  V2DatasetLinksListParamsDC,
  V2DatasetListDataDC,
  V2DatasetListErrorDC,
  V2DatasetListParamsDC,
  V2DatasetLogsListDataDC,
  V2DatasetLogsListErrorDC,
  V2DatasetLogsListParamsDC,
  V2DatasetUpdateDataDC,
  V2DatasetUpdateErrorDC,
  V2DatasetVersionCurrentListDataDC,
  V2DatasetVersionCurrentListErrorDC,
  V2DatasetVersionCurrentListParamsDC,
  V2DatasetVersionCurrentUpdateDataDC,
  V2DatasetVersionCurrentUpdateErrorDC,
  V2DatasetVersionListDataDC,
  V2DatasetVersionListErrorDC,
  V2DatasetVersionListParamsDC,
  V2DatasetVersionUpdateDataDC,
  V2DatasetVersionUpdateErrorDC,
  V2DatasetVersionsListDataDC,
  V2DatasetVersionsListErrorDC,
  V2DatasetVersionsListParamsDC,
  V2DatasetYtListErrorDC,
  V2DatasetYtListParamsDC,
  V2DatasetsApplyScenariosListDataDC,
  V2DatasetsApplyScenariosListErrorDC,
  V2DatasetsClustersListDataDC,
  V2DatasetsClustersListErrorDC,
  V2DatasetsListDataDC,
  V2DatasetsListErrorDC,
  V2DatasetsListParamsDC,
  V2DatasetsSearchCreateDataDC,
  V2DatasetsSearchCreateErrorDC,
} from './data-contracts';
export const datasetApi = new (class DatasetApi {
  /**
   * No description
   *
   * @tags dataset
   * @summary apply dataset (uses orchestrator)
   * @request POST:/api/v1/dataset/apply
   * @responses <br/>
   *  **200** V1DatasetApplyCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   *  **503** ResponsesErrorResponseDC Service Unavailable <br/>
   */
  v1DatasetApplyCreate = (
    request: RequestsApplyDatasetRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1DatasetApplyCreateDataDC, V1DatasetApplyCreateErrorDC>(
      {
        path: `${
          buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
        }/api/v1/dataset/apply`,
        method: 'POST',
        body: request,
        type: ContentType.Json,
        ...params,
      },
    );
  /**
   * No description
   *
   * @tags dataset
   * @summary delete dataset
   * @request DELETE:/api/v1/dataset
   * @responses <br/>
   *  **200** V1DatasetDeleteDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1DatasetDelete = (
    request: RequestsDeleteDatasetRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1DatasetDeleteDataDC, V1DatasetDeleteErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/dataset`,
      method: 'DELETE',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary get dataset update log
   * @request GET:/api/v1/dataset/log
   * @responses <br/>
   *  **200** V1DatasetLogListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1DatasetLogList = (
    query: V1DatasetLogListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1DatasetLogListDataDC, V1DatasetLogListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/dataset/log`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary list dataset update logs
   * @request GET:/api/v1/dataset/logs
   * @responses <br/>
   *  **200** V1DatasetLogsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1DatasetLogsList = (
    query: V1DatasetLogsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1DatasetLogsListDataDC, V1DatasetLogsListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/dataset/logs`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary update dataset log comment
   * @request PUT:/api/v1/dataset/log
   * @responses <br/>
   *  **200** V1DatasetLogUpdateDataDC OK <br/>
   */
  v1DatasetLogUpdate = (
    request: RequestsUpdateDatasetLogCommentRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1DatasetLogUpdateDataDC, any>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/dataset/log`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary validate dataset config
   * @request POST:/api/v2/dataset/config/validate
   * @responses <br/>
   *  **200** V2DatasetConfigValidateCreateDataDC OK <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetConfigValidateCreate = (
    request: RequestsDatasetValidateRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2DatasetConfigValidateCreateDataDC,
      V2DatasetConfigValidateCreateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/dataset/config/validate`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary copy dataset
   * @request POST:/api/v2/dataset/copy
   * @responses <br/>
   *  **200** V2DatasetCopyCreateDataDC OK <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetCopyCreate = (
    request: RequestsCopyDatasetRequestV2DC,
    params: RequestParams = {},
  ) =>
    http.request<V2DatasetCopyCreateDataDC, V2DatasetCopyCreateErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/dataset/copy`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary create dataset
   * @request POST:/api/v2/dataset
   * @responses <br/>
   *  **200** V2DatasetCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **409** ResponsesErrorResponseDC Conflict - resource already exists <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetCreate = (
    request: RequestsCreateDatasetRequestV2DC,
    params: RequestParams = {},
  ) =>
    http.request<V2DatasetCreateDataDC, V2DatasetCreateErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/dataset`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary get dataset linked experiments
   * @request GET:/api/v2/dataset/links
   * @responses <br/>
   *  **200** V2DatasetLinksListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetLinksList = (
    query: V2DatasetLinksListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V2DatasetLinksListDataDC, V2DatasetLinksListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/dataset/links`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary get dataset by id
   * @request GET:/api/v2/dataset
   * @responses <br/>
   *  **200** V2DatasetListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetList = (
    query: V2DatasetListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V2DatasetListDataDC, V2DatasetListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/dataset`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary list dataset update logs
   * @request GET:/api/v2/dataset/logs
   * @responses <br/>
   *  **200** V2DatasetLogsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetLogsList = (
    query: V2DatasetLogsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V2DatasetLogsListDataDC, V2DatasetLogsListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/dataset/logs`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary get available scenarios for dataset apply
   * @request GET:/api/v2/datasets/apply/scenarios
   * @responses <br/>
   *  **200** V2DatasetsApplyScenariosListDataDC OK <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetsApplyScenariosList = (params: RequestParams = {}) =>
    http.request<
      V2DatasetsApplyScenariosListDataDC,
      V2DatasetsApplyScenariosListErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/datasets/apply/scenarios`,
      method: 'GET',
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary get dataset clusters
   * @request GET:/api/v2/datasets/clusters
   * @responses <br/>
   *  **200** V2DatasetsClustersListDataDC OK <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetsClustersList = (params: RequestParams = {}) =>
    http.request<
      V2DatasetsClustersListDataDC,
      V2DatasetsClustersListErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/datasets/clusters`,
      method: 'GET',
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary list datasets in project
   * @request GET:/api/v2/datasets
   * @responses <br/>
   *  **200** V2DatasetsListDataDC OK <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesCreateAppBannerResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetsList = (
    query: V2DatasetsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V2DatasetsListDataDC, V2DatasetsListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/datasets`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary search datasets with filters
   * @request POST:/api/v2/datasets/search
   * @responses <br/>
   *  **200** V2DatasetsSearchCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetsSearchCreate = (
    request: RequestsSearchDatasetsRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2DatasetsSearchCreateDataDC,
      V2DatasetsSearchCreateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/datasets/search`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary update dataset
   * @request PUT:/api/v2/dataset
   * @responses <br/>
   *  **200** V2DatasetUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetUpdate = (
    request: RequestsUpdateDatasetRequestV2DC,
    params: RequestParams = {},
  ) =>
    http.request<V2DatasetUpdateDataDC, V2DatasetUpdateErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/dataset`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary get dataset current version
   * @request GET:/api/v2/dataset/version/current
   * @responses <br/>
   *  **200** V2DatasetVersionCurrentListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetVersionCurrentList = (
    query: V2DatasetVersionCurrentListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2DatasetVersionCurrentListDataDC,
      V2DatasetVersionCurrentListErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/dataset/version/current`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary update version of dataset, you can back to the previous versions
   * @request PUT:/api/v2/dataset/version/current
   * @responses <br/>
   *  **200** V2DatasetVersionCurrentUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetVersionCurrentUpdate = (
    request: RequestsUpdateDatasetVersionRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2DatasetVersionCurrentUpdateDataDC,
      V2DatasetVersionCurrentUpdateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/dataset/version/current`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary get dataset version
   * @request GET:/api/v2/dataset/version
   * @responses <br/>
   *  **200** V2DatasetVersionListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetVersionList = (
    query: V2DatasetVersionListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V2DatasetVersionListDataDC, V2DatasetVersionListErrorDC>(
      {
        path: `${
          buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
        }/api/v2/dataset/version`,
        method: 'GET',
        query: query,
        ...params,
      },
    );
  /**
   * No description
   *
   * @tags dataset
   * @summary list dataset versions
   * @request GET:/api/v2/dataset/versions
   * @responses <br/>
   *  **200** V2DatasetVersionsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetVersionsList = (
    query: V2DatasetVersionsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2DatasetVersionsListDataDC,
      V2DatasetVersionsListErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/dataset/versions`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary update dataset version comment
   * @request PUT:/api/v2/dataset/version
   * @responses <br/>
   *  **200** V2DatasetVersionUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetVersionUpdate = (
    request: RequestsUpdateDatasetVersionCommentRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2DatasetVersionUpdateDataDC,
      V2DatasetVersionUpdateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/dataset/version`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags dataset
   * @summary get dataset yt link
   * @request GET:/api/v2/dataset/yt
   * @responses <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2DatasetYtList = (
    query: V2DatasetYtListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<any, V2DatasetYtListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/dataset/yt`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      ...params,
    });
})();
