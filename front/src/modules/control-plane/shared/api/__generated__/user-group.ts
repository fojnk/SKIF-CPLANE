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
  RequestsCreateUserGroupRequestDC,
  RequestsUpdateUserGroupRequestDC,
  V1UsergroupCreateDataDC,
  V1UsergroupCreateErrorDC,
  V1UsergroupUpdateDataDC,
  V1UsergroupUpdateErrorDC,
  V1UsergroupsListDataDC,
  V1UsergroupsListErrorDC,
} from './data-contracts';
export const userGroupApi = new (class UserGroupApi {
  /**
   * No description
   *
   * @tags user_group
   * @summary create user group
   * @request POST:/api/v1/usergroup
   * @responses <br/>
   *  **200** V1UsergroupCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **409** ResponsesErrorResponseDC Conflict - resource already exists <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1UsergroupCreate = (
    request: RequestsCreateUserGroupRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1UsergroupCreateDataDC, V1UsergroupCreateErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/usergroup`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags user_group
   * @summary list user groups
   * @request GET:/api/v1/usergroups
   * @responses <br/>
   *  **200** V1UsergroupsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1UsergroupsList = (params: RequestParams = {}) =>
    http.request<V1UsergroupsListDataDC, V1UsergroupsListErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/usergroups`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags user_group
   * @summary update user group
   * @request PUT:/api/v1/usergroup
   * @responses <br/>
   *  **200** V1UsergroupUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1UsergroupUpdate = (
    request: RequestsUpdateUserGroupRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1UsergroupUpdateDataDC, V1UsergroupUpdateErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/usergroup`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
})();
