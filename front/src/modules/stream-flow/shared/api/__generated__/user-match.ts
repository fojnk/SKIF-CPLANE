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
  V1UserMatchesListDataDC,
  V1UserMatchesListErrorDC,
  V1UserMatchesListParamsDC,
} from './data-contracts';
export const userMatchApi = new (class UserMatchApi {
  /**
   * No description
   *
   * @tags user_match
   * @summary list user matches
   * @request GET:/api/v1/user_matches
   * @responses <br/>
   *  **200** V1UserMatchesListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1UserMatchesList = (
    query: V1UserMatchesListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1UserMatchesListDataDC, V1UserMatchesListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/user_matches`,
      method: 'GET',
      query: query,
      ...params,
    });
})();
