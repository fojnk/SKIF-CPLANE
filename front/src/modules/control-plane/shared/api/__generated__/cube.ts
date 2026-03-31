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
  RequestsCreateCubeRequestDC,
  RequestsUpdateCubeRequestDC,
  V1CubeListDataDC,
  V1CubeListParamsDC,
  V1CubeNameListDataDC,
  V1CubeNameListParamsDC,
  V1CubeSystemCreateDataDC,
  V1CubeSystemCreateErrorDC,
  V1CubeUpdateDataDC,
  V1CubesByIdsListDataDC,
  V1CubesByIdsListParamsDC,
  V1CubesListDataDC,
} from './data-contracts';
export const cubeApi = new (class CubeApi {
  /**
   * No description
   *
   * @tags cube
   * @summary get cube
   * @request GET:/api/v1/cube
   * @responses <br/>
   *  **200** V1CubeListDataDC OK <br/>
   */
  v1CubeList = (query: V1CubeListParamsDC, params: RequestParams = {}) =>
    http.request<V1CubeListDataDC, any>({
      path: `${buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl}/api/v1/cube`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags cube
   * @summary get cube by name
   * @request GET:/api/v1/cube/name
   * @responses <br/>
   *  **200** V1CubeNameListDataDC OK <br/>
   */
  v1CubeNameList = (
    query: V1CubeNameListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1CubeNameListDataDC, any>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/cube/name`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags cube
   * @summary get list of cubes by provided ids
   * @request GET:/api/v1/cubes/by_ids
   * @responses <br/>
   *  **200** V1CubesByIdsListDataDC OK <br/>
   */
  v1CubesByIdsList = (
    query: V1CubesByIdsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1CubesByIdsListDataDC, any>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/cubes/by_ids`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags cube
   * @summary get list of cubes
   * @request GET:/api/v1/cubes
   * @responses <br/>
   *  **200** V1CubesListDataDC OK <br/>
   */
  v1CubesList = (params: RequestParams = {}) =>
    http.request<V1CubesListDataDC, any>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/cubes`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags cube
   * @summary create system cube
   * @request POST:/api/v1/cube/system
   * @responses <br/>
   *  **200** V1CubeSystemCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **409** ResponsesErrorResponseDC Conflict - resource already exists <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1CubeSystemCreate = (
    request: RequestsCreateCubeRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1CubeSystemCreateDataDC, V1CubeSystemCreateErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/cube/system`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags cube
   * @summary update cube
   * @request PUT:/api/v1/cube
   * @responses <br/>
   *  **200** V1CubeUpdateDataDC OK <br/>
   */
  v1CubeUpdate = (
    request: RequestsUpdateCubeRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1CubeUpdateDataDC, any>({
      path: `${buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl}/api/v1/cube`,
      method: 'PUT',
      body: request,
      type: ContentType.Json,
      ...params,
    });
})();
