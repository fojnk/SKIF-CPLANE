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
  RequestsCreateRobotRequestDC,
  RequestsDeleteAllTokenForRobotRequestDC,
  RequestsGenerateTokenForRobotRequestDC,
  V1RobotCreateDataDC,
  V1RobotCreateErrorDC,
  V1RobotTokenCreateDataDC,
  V1RobotTokenCreateErrorDC,
  V1RobotTokensDeleteDataDC,
  V1RobotTokensDeleteErrorDC,
} from './data-contracts';
export const robotApi = new (class RobotApi {
  /**
   * No description
   *
   * @tags robot
   * @summary create robot
   * @request POST:/api/v1/robot
   * @responses <br/>
   *  **200** V1RobotCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1RobotCreate = (
    request: RequestsCreateRobotRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1RobotCreateDataDC, V1RobotCreateErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/robot`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags robot
   * @summary generate robot token
   * @request POST:/api/v1/robot/token
   * @responses <br/>
   *  **200** V1RobotTokenCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1RobotTokenCreate = (
    request: RequestsGenerateTokenForRobotRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1RobotTokenCreateDataDC, V1RobotTokenCreateErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/robot/token`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags robot
   * @summary delete all robot tokens
   * @request DELETE:/api/v1/robot/tokens
   * @responses <br/>
   *  **200** V1RobotTokensDeleteDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1RobotTokensDelete = (
    request: RequestsDeleteAllTokenForRobotRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1RobotTokensDeleteDataDC, V1RobotTokensDeleteErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v1/robot/tokens`,
      method: 'DELETE',
      body: request,
      type: ContentType.Json,
      ...params,
    });
})();
