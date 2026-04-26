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

import { ContentType, RequestParams } from "@/shared/api/common/http-client";
import { apiUrl, http } from "@/shared/api/http";
import {
  RequestsAddPinnedRequestDC,
  RequestsCreateProjectRequestDC,
  RequestsDeletePinnedProjectRequestDC,
  RequestsDeleteProjectRequestDC,
  RequestsListProjectsRequestV2DC,
  RequestsProjectValidateRequestDC,
  RequestsUpdateProjectLogCommentRequestDC,
  RequestsUpdateProjectRequestDC,
  V1ProjectConfigListDataDC,
  V1ProjectConfigListParamsDC,
  V1ProjectConfigsListDataDC,
  V1ProjectConfigsListErrorDC,
  V1ProjectConfigsListParamsDC,
  V1ProjectCreateDataDC,
  V1ProjectCreateErrorDC,
  V1ProjectDeleteDataDC,
  V1ProjectDeleteErrorDC,
  V1ProjectLogListDataDC,
  V1ProjectLogListErrorDC,
  V1ProjectLogListParamsDC,
  V1ProjectLogUpdateDataDC,
  V1ProjectLogUpdateErrorDC,
  V1ProjectLogsListDataDC,
  V1ProjectLogsListErrorDC,
  V1ProjectLogsListParamsDC,
  V1ProjectUpdateDataDC,
  V1ProjectUpdateErrorDC,
  V1ProjectsListDataDC,
  V1ProjectsListErrorDC,
  V1ProjectsListParamsDC,
  V2ProjectConfigValidateCreateDataDC,
  V2ProjectConfigValidateCreateErrorDC,
  V2ProjectListDataDC,
  V2ProjectListErrorDC,
  V2ProjectListParamsDC,
  V2ProjectPinnedCreateDataDC,
  V2ProjectPinnedCreateErrorDC,
  V2ProjectPinnedDeleteDataDC,
  V2ProjectPinnedDeleteErrorDC,
  V2ProjectUrlsListDataDC,
  V2ProjectUrlsListErrorDC,
  V2ProjectUrlsListParamsDC,
  V2ProjectsCreateDataDC,
  V2ProjectsCreateErrorDC,
  V2ProjectsPinnedListDataDC,
  V2ProjectsPinnedListErrorDC,
} from "./data-contracts";
export const projectApi = new (class ProjectApi {
  /**
   * No description
   *
   * @tags project
   * @summary get project config by id
   * @request GET:/api/v1/project/config
   * @responses <br/>
   *  **200** V1ProjectConfigListDataDC OK <br/>
   */
  v1ProjectConfigList = (query: V1ProjectConfigListParamsDC, params: RequestParams = {}) =>
    http.request<V1ProjectConfigListDataDC, any>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/project/config`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary list project configs
   * @request GET:/api/v1/project/configs
   * @responses <br/>
   *  **200** V1ProjectConfigsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ProjectConfigsList = (query: V1ProjectConfigsListParamsDC, params: RequestParams = {}) =>
    http.request<V1ProjectConfigsListDataDC, V1ProjectConfigsListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/project/configs`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary create project
   * @request POST:/api/v1/project
   * @responses <br/>
   *  **200** V1ProjectCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **409** ResponsesErrorResponseDC Conflict - resource already exists <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ProjectCreate = (request: RequestsCreateProjectRequestDC, params: RequestParams = {}) =>
    http.request<V1ProjectCreateDataDC, V1ProjectCreateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/project`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary delete project
   * @request DELETE:/api/v1/project
   * @responses <br/>
   *  **200** V1ProjectDeleteDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ProjectDelete = (request: RequestsDeleteProjectRequestDC, params: RequestParams = {}) =>
    http.request<V1ProjectDeleteDataDC, V1ProjectDeleteErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/project`,
      method: "DELETE",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary get project update log
   * @request GET:/api/v1/project/log
   * @responses <br/>
   *  **200** V1ProjectLogListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ProjectLogList = (query: V1ProjectLogListParamsDC, params: RequestParams = {}) =>
    http.request<V1ProjectLogListDataDC, V1ProjectLogListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/project/log`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary list project update logs
   * @request GET:/api/v1/project/logs
   * @responses <br/>
   *  **200** V1ProjectLogsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ProjectLogsList = (query: V1ProjectLogsListParamsDC, params: RequestParams = {}) =>
    http.request<V1ProjectLogsListDataDC, V1ProjectLogsListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/project/logs`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary update project log comment
   * @request PUT:/api/v1/project/log
   * @responses <br/>
   *  **200** V1ProjectLogUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ProjectLogUpdate = (request: RequestsUpdateProjectLogCommentRequestDC, params: RequestParams = {}) =>
    http.request<V1ProjectLogUpdateDataDC, V1ProjectLogUpdateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/project/log`,
      method: "PUT",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary list projects in namespace
   * @request GET:/api/v1/projects
   * @responses <br/>
   *  **200** V1ProjectsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ProjectsList = (query: V1ProjectsListParamsDC, params: RequestParams = {}) =>
    http.request<V1ProjectsListDataDC, V1ProjectsListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/projects`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary update project
   * @request PUT:/api/v1/project
   * @responses <br/>
   *  **200** V1ProjectUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1ProjectUpdate = (request: RequestsUpdateProjectRequestDC, params: RequestParams = {}) =>
    http.request<V1ProjectUpdateDataDC, V1ProjectUpdateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/project`,
      method: "PUT",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary validate project config
   * @request POST:/api/v2/project/config/validate
   * @responses <br/>
   *  **200** V2ProjectConfigValidateCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ProjectConfigValidateCreate = (request: RequestsProjectValidateRequestDC, params: RequestParams = {}) =>
    http.request<V2ProjectConfigValidateCreateDataDC, V2ProjectConfigValidateCreateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v2/project/config/validate`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary get project by id
   * @request GET:/api/v2/project
   * @responses <br/>
   *  **200** V2ProjectListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ProjectList = (query: V2ProjectListParamsDC, params: RequestParams = {}) =>
    http.request<V2ProjectListDataDC, V2ProjectListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v2/project`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary addPinnedProject
   * @request POST:/api/v2/project/pinned
   * @responses <br/>
   *  **200** V2ProjectPinnedCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ProjectPinnedCreate = (request: RequestsAddPinnedRequestDC, params: RequestParams = {}) =>
    http.request<V2ProjectPinnedCreateDataDC, V2ProjectPinnedCreateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v2/project/pinned`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary delete pin on project
   * @request DELETE:/api/v2/project/pinned
   * @responses <br/>
   *  **200** V2ProjectPinnedDeleteDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ProjectPinnedDelete = (request: RequestsDeletePinnedProjectRequestDC, params: RequestParams = {}) =>
    http.request<V2ProjectPinnedDeleteDataDC, V2ProjectPinnedDeleteErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v2/project/pinned`,
      method: "DELETE",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary search projects with filters
   * @request POST:/api/v2/projects
   * @responses <br/>
   *  **200** V2ProjectsCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ProjectsCreate = (request: RequestsListProjectsRequestV2DC, params: RequestParams = {}) =>
    http.request<V2ProjectsCreateDataDC, V2ProjectsCreateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v2/projects`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary list user's pinned projects
   * @request GET:/api/v2/projects/pinned
   * @responses <br/>
   *  **200** V2ProjectsPinnedListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ProjectsPinnedList = (params: RequestParams = {}) =>
    http.request<V2ProjectsPinnedListDataDC, V2ProjectsPinnedListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v2/projects/pinned`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags project
   * @summary get project urls
   * @request GET:/api/v2/project/urls
   * @responses <br/>
   *  **200** V2ProjectUrlsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesCreateAppBannerResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ProjectUrlsList = (query: V2ProjectUrlsListParamsDC, params: RequestParams = {}) =>
    http.request<V2ProjectUrlsListDataDC, V2ProjectUrlsListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v2/project/urls`,
      method: "GET",
      query: query,
      type: ContentType.Json,
      ...params,
    });
})();
