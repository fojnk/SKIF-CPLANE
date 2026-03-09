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
  RequestsCreateUserRequestDC,
  V1UserCreateDataDC,
  V1UserCreateErrorDC,
  V1UserListDataDC,
  V1UserListErrorDC,
  V1UserListParamsDC,
  V1UsersListDataDC,
  V1UsersListErrorDC,
  V1UsersListParamsDC,
  V1WhoAmIListDataDC,
  V1WhoAmIListErrorDC,
  V2UserRolesListDataDC,
  V2UserRolesListErrorDC,
  V2UserRolesListParamsDC,
} from './data-contracts';
export const userApi = new (class UserApi {
  /**
   * No description
   *
   * @tags user
   * @summary create user
   * @request POST:/api/v1/user
   * @responses <br/>
   *  **200** V1UserCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **409** ResponsesErrorResponseDC Conflict - resource already exists <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1UserCreate = (
    request: RequestsCreateUserRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1UserCreateDataDC, V1UserCreateErrorDC>({
      path: `${buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl}/api/v1/user`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags user
   * @summary get user by name
   * @request GET:/api/v1/user
   * @responses <br/>
   *  **200** V1UserListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1UserList = (query: V1UserListParamsDC, params: RequestParams = {}) =>
    http.request<V1UserListDataDC, V1UserListErrorDC>({
      path: `${buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl}/api/v1/user`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags user
   * @summary list users in user group
   * @request GET:/api/v1/users
   * @responses <br/>
   *  **200** V1UsersListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1UsersList = (query: V1UsersListParamsDC, params: RequestParams = {}) =>
    http.request<V1UsersListDataDC, V1UsersListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/users`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags user
   * @summary who am i
   * @request GET:/api/v1/who_am_i
   * @responses <br/>
   *  **200** V1WhoAmIListDataDC OK <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1WhoAmIList = (params: RequestParams = {}) =>
    http.request<V1WhoAmIListDataDC, V1WhoAmIListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/who_am_i`,
      method: 'GET',
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags user
   * @summary list user roles
   * @request GET:/api/v2/user/roles
   * @responses <br/>
   *  **200** V2UserRolesListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2UserRolesList = (
    query: V2UserRolesListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V2UserRolesListDataDC, V2UserRolesListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/user/roles`,
      method: 'GET',
      query: query,
      ...params,
    });
})();
