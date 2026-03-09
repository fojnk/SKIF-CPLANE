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
  RequestsCreateRuleRequestDC,
  V1RuleCreateDataDC,
  V1RuleCreateErrorDC,
  V1RulesListDataDC,
  V1RulesListErrorDC,
  V1RulesListParamsDC,
} from './data-contracts';
export const ruleApi = new (class RuleApi {
  /**
   * No description
   *
   * @tags rule
   * @summary create rule
   * @request POST:/api/v1/rule
   * @responses <br/>
   *  **200** V1RuleCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1RuleCreate = (
    request: RequestsCreateRuleRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1RuleCreateDataDC, V1RuleCreateErrorDC>({
      path: `${buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl}/api/v1/rule`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags rule
   * @summary list role rules
   * @request GET:/api/v1/rules
   * @responses <br/>
   *  **200** V1RulesListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1RulesList = (query: V1RulesListParamsDC, params: RequestParams = {}) =>
    http.request<V1RulesListDataDC, V1RulesListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/rules`,
      method: 'GET',
      query: query,
      ...params,
    });
})();
