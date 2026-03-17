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
  V1PingListDataDC,
  V1PingListErrorDC,
  V1VersionListDataDC,
  V1VersionListErrorDC,
} from './data-contracts';
export const metaApi = new (class MetaApi {
  /**
   * @description As if to say even louder to the world: here is the best ping handler in the world
   *
   * @tags meta
   * @summary ping me
   * @request GET:/api/v1/ping
   * @responses <br/>
   *  **200** V1PingListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesCreateAppBannerResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1PingList = (params: RequestParams = {}) =>
    http.request<V1PingListDataDC, V1PingListErrorDC>({
      path: `${buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl}/api/v1/ping`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags meta
   * @summary get current project version
   * @request GET:/api/v1/version
   * @responses <br/>
   *  **200** V1VersionListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1VersionList = (params: RequestParams = {}) =>
    http.request<V1VersionListDataDC, V1VersionListErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/version`,
      method: 'GET',
      ...params,
    });
})();
