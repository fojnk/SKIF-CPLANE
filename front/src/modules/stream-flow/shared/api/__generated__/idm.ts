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
  RequestsCreateNamespaceRolesRequestDC,
  RequestsCreateProjectRolesRequestDC,
  RequestsSyncNamespaceRolesRequestDC,
  RequestsSyncProjectRolesRequestDC,
  V2IdmNamespaceRolesCreateDataDC,
  V2IdmNamespaceRolesCreateErrorDC,
  V2IdmNamespaceRolesSyncCreateDataDC,
  V2IdmNamespaceRolesSyncCreateErrorDC,
  V2IdmProjectRolesCreateDataDC,
  V2IdmProjectRolesCreateErrorDC,
  V2IdmProjectRolesSyncCreateDataDC,
  V2IdmProjectRolesSyncCreateErrorDC,
} from './data-contracts';
export const idmApi = new (class IdmApi {
  /**
   * No description
   *
   * @tags idm
   * @summary create and push namespace roles to idm
   * @request POST:/api/v2/idm/namespace/roles
   * @responses <br/>
   *  **200** V2IdmNamespaceRolesCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2IdmNamespaceRolesCreate = (
    request: RequestsCreateNamespaceRolesRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2IdmNamespaceRolesCreateDataDC,
      V2IdmNamespaceRolesCreateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/idm/namespace/roles`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags idm
   * @summary sync namespace roles to idm (if no ids - will be synced all namespace, overwise only in id list)
   * @request POST:/api/v2/idm/namespace/roles/sync
   * @responses <br/>
   *  **200** V2IdmNamespaceRolesSyncCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2IdmNamespaceRolesSyncCreate = (
    request: RequestsSyncNamespaceRolesRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2IdmNamespaceRolesSyncCreateDataDC,
      V2IdmNamespaceRolesSyncCreateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/idm/namespace/roles/sync`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags idm
   * @summary create and push project roles to idm
   * @request POST:/api/v2/idm/project/roles
   * @responses <br/>
   *  **200** V2IdmProjectRolesCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2IdmProjectRolesCreate = (
    request: RequestsCreateProjectRolesRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V2IdmProjectRolesCreateDataDC, V2IdmProjectRolesCreateErrorDC>(
      {
        path: `${
          buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
        }/api/v2/idm/project/roles`,
        method: 'POST',
        body: request,
        type: ContentType.Json,
        ...params,
      },
    );
  /**
   * No description
   *
   * @tags idm
   * @summary sync project roles to idm (if no ids - will be synced all projects, overwise only projects in id list)
   * @request POST:/api/v2/idm/project/roles/sync
   * @responses <br/>
   *  **200** V2IdmProjectRolesSyncCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2IdmProjectRolesSyncCreate = (
    request: RequestsSyncProjectRolesRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2IdmProjectRolesSyncCreateDataDC,
      V2IdmProjectRolesSyncCreateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/idm/project/roles/sync`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
})();
