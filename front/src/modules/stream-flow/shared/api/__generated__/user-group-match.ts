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

import { RequestParams } from '@/shared/api/common/http-client';
import { apiUrl, http } from '@/shared/api/http';
import {
  V1UserGroupMatchesListDataDC,
  V1UserGroupMatchesListErrorDC,
  V1UserGroupMatchesListParamsDC,
} from './data-contracts';
export const userGroupMatchApi = new (class UserGroupMatchApi {
  /**
   * No description
   *
   * @tags user_group_match
   * @summary list user group matches
   * @request GET:/api/v1/user_group_matches
   * @responses <br/>
   *  **200** V1UserGroupMatchesListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1UserGroupMatchesList = (
    query: V1UserGroupMatchesListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1UserGroupMatchesListDataDC, V1UserGroupMatchesListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/user_group_matches`,
      method: 'GET',
      query: query,
      ...params,
    });
})();
