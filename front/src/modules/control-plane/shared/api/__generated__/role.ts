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
  RequestsCreateRoleRequestDC,
  RequestsUpdateRoleRequestDC,
  V1RoleCreateDataDC,
  V1RoleCreateErrorDC,
  V1RoleUpdateDataDC,
  V1RoleUpdateErrorDC,
  V1RolesListDataDC,
  V1RolesListErrorDC,
} from './data-contracts';
export const roleApi = new (class RoleApi {
  /**
   * No description
   *
   * @tags role
   * @summary create role
   * @request POST:/api/v1/role
   * @responses <br/>
   *  **200** V1RoleCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **409** ResponsesErrorResponseDC Conflict - resource already exists <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1RoleCreate = (
    request: RequestsCreateRoleRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1RoleCreateDataDC, V1RoleCreateErrorDC>({
      path: `${buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl}/api/v1/role`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags role
   * @summary list roles
   * @request GET:/api/v1/roles
   * @responses <br/>
   *  **200** V1RolesListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1RolesList = (params: RequestParams = {}) =>
    http.request<V1RolesListDataDC, V1RolesListErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/roles`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags role
   * @summary update role
   * @request PUT:/api/v1/role
   * @responses <br/>
   *  **200** V1RoleUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1RoleUpdate = (
    request: RequestsUpdateRoleRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1RoleUpdateDataDC, V1RoleUpdateErrorDC>({
      path: `${buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl}/api/v1/role`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
})();
