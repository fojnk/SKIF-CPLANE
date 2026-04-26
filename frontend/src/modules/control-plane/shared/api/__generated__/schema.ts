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

import { RequestParams } from "@/shared/api/common/http-client";
import { apiUrl, http } from "@/shared/api/http";
import { V2SchemaListDataDC, V2SchemaListErrorDC, V2SchemaListParamsDC } from "./data-contracts";
export const schemaApi = new (class SchemaApi {
  /**
   * No description
   *
   * @tags schema
   * @summary get config schema by config type
   * @request GET:/api/v2/schema
   * @responses <br/>
   *  **200** V2SchemaListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2SchemaList = (query: V2SchemaListParamsDC, params: RequestParams = {}) =>
    http.request<V2SchemaListDataDC, V2SchemaListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v2/schema`,
      method: "GET",
      query: query,
      ...params,
    });
})();
