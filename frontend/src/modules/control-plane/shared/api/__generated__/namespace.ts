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
  RequestsCreateNamespaceRequestDC,
  RequestsDeleteNamespaceRequestDC,
  RequestsUpdateNamespaceLogCommentRequestDC,
  RequestsUpdateNamespaceRequestDC,
  V1NamespaceConfigListDataDC,
  V1NamespaceConfigListErrorDC,
  V1NamespaceConfigListParamsDC,
  V1NamespaceConfigsListDataDC,
  V1NamespaceConfigsListErrorDC,
  V1NamespaceConfigsListParamsDC,
  V1NamespaceCreateDataDC,
  V1NamespaceCreateErrorDC,
  V1NamespaceDeleteDataDC,
  V1NamespaceDeleteErrorDC,
  V1NamespaceListDataDC,
  V1NamespaceListErrorDC,
  V1NamespaceListParamsDC,
  V1NamespaceLogListDataDC,
  V1NamespaceLogListErrorDC,
  V1NamespaceLogListParamsDC,
  V1NamespaceLogUpdateDataDC,
  V1NamespaceLogUpdateErrorDC,
  V1NamespaceLogsListDataDC,
  V1NamespaceLogsListErrorDC,
  V1NamespaceLogsListParamsDC,
  V1NamespaceUpdateDataDC,
  V1NamespaceUpdateErrorDC,
  V1NamespacesListDataDC,
  V1NamespacesListErrorDC,
  V2NamespacesListDataDC,
  V2NamespacesListErrorDC,
} from './data-contracts';
export const namespaceApi = new (class NamespaceApi {
  /**
   * No description
   *
   * @tags namespace
   * @summary get namespace config by id
   * @request GET:/api/v1/namespace/config
   * @responses <br/>
   *  **200** V1NamespaceConfigListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1NamespaceConfigList = (
    query: V1NamespaceConfigListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1NamespaceConfigListDataDC, V1NamespaceConfigListErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/namespace/config`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags namespace
   * @summary list namespace configs
   * @request GET:/api/v1/namespace/configs
   * @responses <br/>
   *  **200** V1NamespaceConfigsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1NamespaceConfigsList = (
    query: V1NamespaceConfigsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1NamespaceConfigsListDataDC, V1NamespaceConfigsListErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/namespace/configs`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags namespace
   * @summary create namespace
   * @request POST:/api/v1/namespace
   * @responses <br/>
   *  **200** V1NamespaceCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **409** ResponsesErrorResponseDC Conflict - resource already exists <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1NamespaceCreate = (
    request: RequestsCreateNamespaceRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1NamespaceCreateDataDC, V1NamespaceCreateErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/namespace`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags namespace
   * @summary delete namespace
   * @request DELETE:/api/v1/namespace
   * @responses <br/>
   *  **200** V1NamespaceDeleteDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1NamespaceDelete = (
    request: RequestsDeleteNamespaceRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1NamespaceDeleteDataDC, V1NamespaceDeleteErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/namespace`,
      method: 'DELETE',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags namespace
   * @summary get namespace
   * @request GET:/api/v1/namespace
   * @responses <br/>
   *  **200** V1NamespaceListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1NamespaceList = (
    query: V1NamespaceListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1NamespaceListDataDC, V1NamespaceListErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/namespace`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags namespace
   * @summary get namespace update log
   * @request GET:/api/v1/namespace/log
   * @responses <br/>
   *  **200** V1NamespaceLogListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1NamespaceLogList = (
    query: V1NamespaceLogListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1NamespaceLogListDataDC, V1NamespaceLogListErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/namespace/log`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags namespace
   * @summary list namespace update logs
   * @request GET:/api/v1/namespace/logs
   * @responses <br/>
   *  **200** V1NamespaceLogsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1NamespaceLogsList = (
    query: V1NamespaceLogsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1NamespaceLogsListDataDC, V1NamespaceLogsListErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/namespace/logs`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags namespace
   * @summary update namespace log comment
   * @request PUT:/api/v1/namespace/log
   * @responses <br/>
   *  **200** V1NamespaceLogUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1NamespaceLogUpdate = (
    request: RequestsUpdateNamespaceLogCommentRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1NamespaceLogUpdateDataDC, V1NamespaceLogUpdateErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/namespace/log`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags namespace
   * @summary list namespaces
   * @request GET:/api/v1/namespaces
   * @responses <br/>
   *  **200** V1NamespacesListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1NamespacesList = (params: RequestParams = {}) =>
    http.request<V1NamespacesListDataDC, V1NamespacesListErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/namespaces`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags namespace
   * @summary update namespace
   * @request PUT:/api/v1/namespace
   * @responses <br/>
   *  **200** V1NamespaceUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1NamespaceUpdate = (
    request: RequestsUpdateNamespaceRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1NamespaceUpdateDataDC, V1NamespaceUpdateErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/namespace`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags namespace
   * @summary list namespaces v2
   * @request GET:/api/v2/namespaces
   * @responses <br/>
   *  **200** V2NamespacesListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2NamespacesList = (params: RequestParams = {}) =>
    http.request<V2NamespacesListDataDC, V2NamespacesListErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v2/namespaces`,
      method: 'GET',
      ...params,
    });
})();
