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
  AuthorizeListParamsDC,
  LogoutListDataDC,
  LogoutListErrorDC,
  RefreshListDataDC,
  RefreshListErrorDC,
  TokenListDataDC,
  TokenListErrorDC,
  TokenListParamsDC,
  WhoAmIListDataDC,
  WhoAmIListErrorDC,
} from "./data-contracts";
export const oauthApi = new (class OauthApi {
  /**
   * @description Start authorize oauth2 for user
   *
   * @tags oauth
   * @summary Start authorize oauth2 for user
   * @request GET:/auth/authorize
   * @responses <br/>
   *  **302** void Found <br/>
   */
  authorizeList = (query: AuthorizeListParamsDC, params: RequestParams = {}) =>
    http.request<any, void>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/auth/authorize`,
      method: "GET",
      query: query,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags oauth
   * @summary Logout
   * @request GET:/auth/logout
   * @responses <br/>
   *  **200** LogoutListDataDC OK <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  logoutList = (params: RequestParams = {}) =>
    http.request<LogoutListDataDC, LogoutListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/auth/logout`,
      method: "GET",
      ...params,
    });
  /**
   * @description RefreshSession jwt token for user
   *
   * @tags oauth
   * @summary RefreshSession jwt token for user
   * @request GET:/auth/refresh
   * @responses <br/>
   *  **200** RefreshListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   *  **503** ResponsesErrorResponseDC oauth service unavailable <br/>
   */
  refreshList = (params: RequestParams = {}) =>
    http.request<RefreshListDataDC, RefreshListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/auth/refresh`,
      method: "GET",
      type: ContentType.Json,
      ...params,
    });
  /**
   * @description Handel oauth2 token, to generate auth jwt token
   *
   * @tags oauth
   * @summary Handel oauth2 token, to generate auth jwt token
   * @request GET:/auth/token
   * @responses <br/>
   *  **200** TokenListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   *  **503** ResponsesErrorResponseDC oauth service unavailable <br/>
   */
  tokenList = (query: TokenListParamsDC, params: RequestParams = {}) =>
    http.request<TokenListDataDC, TokenListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/auth/token`,
      method: "GET",
      query: query,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags oauth
   * @summary who am i
   * @request GET:/auth/who_am_i
   * @responses <br/>
   *  **200** WhoAmIListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   *  **503** ResponsesErrorResponseDC oauth service unavailable <br/>
   */
  whoAmIList = (params: RequestParams = {}) =>
    http.request<WhoAmIListDataDC, WhoAmIListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/auth/who_am_i`,
      method: "GET",
      type: ContentType.Json,
      ...params,
    });
})();
