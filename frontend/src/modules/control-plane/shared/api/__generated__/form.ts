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
  V2FormsDatasetListDataDC,
  V2FormsDatasetListErrorDC,
  V2FormsDatasetListParamsDC,
  V2FormsExperimentListDataDC,
  V2FormsExperimentListErrorDC,
  V2FormsProjectListDataDC,
  V2FormsProjectListErrorDC,
} from "./data-contracts";
export const formApi = new (class FormApi {
  /**
   * No description
   *
   * @tags form
   * @summary get dataset config edit form
   * @request GET:/api/v2/forms/dataset
   * @responses <br/>
   *  **200** V2FormsDatasetListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2FormsDatasetList = (query: V2FormsDatasetListParamsDC, params: RequestParams = {}) =>
    http.request<V2FormsDatasetListDataDC, V2FormsDatasetListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v2/forms/dataset`,
      method: "GET",
      query: query,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags form
   * @summary get project config edit form
   * @request GET:/api/v2/forms/experiment
   * @responses <br/>
   *  **200** V2FormsExperimentListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2FormsExperimentList = (params: RequestParams = {}) =>
    http.request<V2FormsExperimentListDataDC, V2FormsExperimentListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v2/forms/experiment`,
      method: "GET",
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags form
   * @summary get project config edit form
   * @request GET:/api/v2/forms/project
   * @responses <br/>
   *  **200** V2FormsProjectListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2FormsProjectList = (params: RequestParams = {}) =>
    http.request<V2FormsProjectListDataDC, V2FormsProjectListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v2/forms/project`,
      method: "GET",
      type: ContentType.Json,
      ...params,
    });
})();
