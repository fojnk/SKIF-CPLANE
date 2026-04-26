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
  RequestsAddRuleToRoleRequestDC,
  RequestsAddUserToGroupRequestDC,
  RequestsDisclaimRequestDC,
  RequestsGrantRequestDC,
  RequestsRemoveRuleFromRoleRequestDC,
  RequestsRemoveUserFromGroupRequestDC,
  V1DisclaimCreateDataDC,
  V1DisclaimCreateErrorDC,
  V1GrantCreateDataDC,
  V1GrantCreateErrorDC,
  V1PermissionsListDataDC,
  V1PermissionsListErrorDC,
  V1PermissionsListParamsDC,
  V1RoleRuleCreateDataDC,
  V1RoleRuleCreateErrorDC,
  V1RoleRuleDeleteDataDC,
  V1RoleRuleDeleteErrorDC,
  V1UsergroupUserCreateDataDC,
  V1UsergroupUserCreateErrorDC,
  V1UsergroupUserDeleteDataDC,
  V1UsergroupUserDeleteErrorDC,
  V2AclCheckListDataDC,
  V2AclCheckListErrorDC,
  V2AclCheckListParamsDC,
  V2AclUsersListDataDC,
  V2AclUsersListErrorDC,
  V2AclUsersListParamsDC,
  V2MeCapabilitiesListDataDC,
  V2MeCapabilitiesListErrorDC,
} from "./data-contracts";
export const aclApi = new (class AclApi {
  /**
   * No description
   *
   * @tags acl
   * @summary disclaim permission
   * @request POST:/api/v1/disclaim
   * @responses <br/>
   *  **200** V1DisclaimCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1DisclaimCreate = (request: RequestsDisclaimRequestDC, params: RequestParams = {}) =>
    http.request<V1DisclaimCreateDataDC, V1DisclaimCreateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/disclaim`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags acl
   * @summary grant permission
   * @request POST:/api/v1/grant
   * @responses <br/>
   *  **200** V1GrantCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1GrantCreate = (request: RequestsGrantRequestDC, params: RequestParams = {}) =>
    http.request<V1GrantCreateDataDC, V1GrantCreateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/grant`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags acl
   * @summary list user's permitted actions on the given resource
   * @request GET:/api/v1/permissions
   * @responses <br/>
   *  **200** V1PermissionsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1PermissionsList = (query: V1PermissionsListParamsDC, params: RequestParams = {}) =>
    http.request<V1PermissionsListDataDC, V1PermissionsListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/permissions`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags acl
   * @summary add rule to role
   * @request POST:/api/v1/role/rule
   * @responses <br/>
   *  **200** V1RoleRuleCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1RoleRuleCreate = (request: RequestsAddRuleToRoleRequestDC, params: RequestParams = {}) =>
    http.request<V1RoleRuleCreateDataDC, V1RoleRuleCreateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/role/rule`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags acl
   * @summary remove rule from role
   * @request DELETE:/api/v1/role/rule
   * @responses <br/>
   *  **200** V1RoleRuleDeleteDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1RoleRuleDelete = (request: RequestsRemoveRuleFromRoleRequestDC, params: RequestParams = {}) =>
    http.request<V1RoleRuleDeleteDataDC, V1RoleRuleDeleteErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/role/rule`,
      method: "DELETE",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags acl
   * @summary add user to user_group
   * @request POST:/api/v1/usergroup/user
   * @responses <br/>
   *  **200** V1UsergroupUserCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1UsergroupUserCreate = (request: RequestsAddUserToGroupRequestDC, params: RequestParams = {}) =>
    http.request<V1UsergroupUserCreateDataDC, V1UsergroupUserCreateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/usergroup/user`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags acl
   * @summary remove user from user_group
   * @request DELETE:/api/v1/usergroup/user
   * @responses <br/>
   *  **200** V1UsergroupUserDeleteDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1UsergroupUserDelete = (request: RequestsRemoveUserFromGroupRequestDC, params: RequestParams = {}) =>
    http.request<V1UsergroupUserDeleteDataDC, V1UsergroupUserDeleteErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/usergroup/user`,
      method: "DELETE",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags acl
   * @summary list user's permitted actions on the given object
   * @request GET:/api/v2/acl/check
   * @responses <br/>
   *  **200** V2AclCheckListDataDC OK <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2AclCheckList = (query: V2AclCheckListParamsDC, params: RequestParams = {}) =>
    http.request<V2AclCheckListDataDC, V2AclCheckListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v2/acl/check`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags acl
   * @summary list users and permitted actions on the given object
   * @request GET:/api/v2/acl/users
   * @responses <br/>
   *  **200** V2AclUsersListDataDC OK <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2AclUsersList = (query: V2AclUsersListParamsDC, params: RequestParams = {}) =>
    http.request<V2AclUsersListDataDC, V2AclUsersListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v2/acl/users`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags acl
   * @summary get current user capabilities
   * @request GET:/api/v2/me/capabilities
   * @responses <br/>
   *  **200** V2MeCapabilitiesListDataDC OK <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2MeCapabilitiesList = (params: RequestParams = {}) =>
    http.request<V2MeCapabilitiesListDataDC, V2MeCapabilitiesListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v2/me/capabilities`,
      method: "GET",
      ...params,
    });
})();
