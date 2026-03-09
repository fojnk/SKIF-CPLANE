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
  RequestsChangeAlertBodyDC,
  RequestsChangeAlertSeveritiesBodyDC,
  RequestsCreateAlertGroupBodyDC,
  RequestsDeleteAlertsBodyDC,
  V2ExperimentAlertsCreateDataDC,
  V2ExperimentAlertsCreateErrorDC,
  V2ExperimentAlertsCreateParamsDC,
  V2ExperimentAlertsDeleteDataDC,
  V2ExperimentAlertsDeleteErrorDC,
  V2ExperimentAlertsDeleteParamsDC,
  V2ExperimentAlertsListDataDC,
  V2ExperimentAlertsListErrorDC,
  V2ExperimentAlertsListParamsDC,
  V2ExperimentAlertsOptionsListDataDC,
  V2ExperimentAlertsOptionsListErrorDC,
  V2ExperimentAlertsProductsListDataDC,
  V2ExperimentAlertsProductsListErrorDC,
  V2ExperimentAlertsProductsListParamsDC,
  V2ExperimentAlertsRuleUpdateDataDC,
  V2ExperimentAlertsRuleUpdateErrorDC,
  V2ExperimentAlertsRuleUpdateParamsDC,
  V2ExperimentAlertsTemplateUpdateDataDC,
  V2ExperimentAlertsTemplateUpdateErrorDC,
  V2ExperimentAlertsTemplateUpdateParamsDC,
} from './data-contracts';
export const alertsApi = new (class AlertsApi {
  /**
   * No description
   *
   * @tags alerts
   * @summary create alert group
   * @request POST:/api/v2/experiment/alerts
   * @responses <br/>
   *  **200** V2ExperimentAlertsCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentAlertsCreate = (
    query: V2ExperimentAlertsCreateParamsDC,
    request: RequestsCreateAlertGroupBodyDC,
    params: RequestParams = {},
  ) =>
    http.request<V2ExperimentAlertsCreateDataDC, V2ExperimentAlertsCreateErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/alerts`,
      method: 'POST',
      query: query,
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags alerts
   * @summary delete alert group
   * @request DELETE:/api/v2/experiment/alerts
   * @responses <br/>
   *  **200** V2ExperimentAlertsDeleteDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentAlertsDelete = (
    query: V2ExperimentAlertsDeleteParamsDC,
    request: RequestsDeleteAlertsBodyDC,
    params: RequestParams = {},
  ) =>
    http.request<V2ExperimentAlertsDeleteDataDC, V2ExperimentAlertsDeleteErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/alerts`,
      method: 'DELETE',
      query: query,
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags alerts
   * @summary get alert group
   * @request GET:/api/v2/experiment/alerts
   * @responses <br/>
   *  **200** V2ExperimentAlertsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentAlertsList = (
    query: V2ExperimentAlertsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V2ExperimentAlertsListDataDC, V2ExperimentAlertsListErrorDC>({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/alerts`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags alerts
   * @summary get alert templates
   * @request GET:/api/v2/experiment/alerts/options
   * @responses <br/>
   *  **200** V2ExperimentAlertsOptionsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentAlertsOptionsList = (params: RequestParams = {}) =>
    http.request<
      V2ExperimentAlertsOptionsListDataDC,
      V2ExperimentAlertsOptionsListErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/alerts/options`,
      method: 'GET',
      ...params,
    });
  /**
   * No description
   *
   * @tags alerts
   * @summary get products for alerts
   * @request GET:/api/v2/experiment/alerts/products
   * @responses <br/>
   *  **200** V2ExperimentAlertsProductsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentAlertsProductsList = (
    query: V2ExperimentAlertsProductsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2ExperimentAlertsProductsListDataDC,
      V2ExperimentAlertsProductsListErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/alerts/products`,
      method: 'GET',
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags alerts
   * @summary change alert
   * @request PUT:/api/v2/experiment/alerts/rule
   * @responses <br/>
   *  **200** V2ExperimentAlertsRuleUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentAlertsRuleUpdate = (
    query: V2ExperimentAlertsRuleUpdateParamsDC,
    request: RequestsChangeAlertBodyDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2ExperimentAlertsRuleUpdateDataDC,
      V2ExperimentAlertsRuleUpdateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/alerts/rule`,
      method: 'PUT',
      query: query,
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags alerts
   * @summary change alert severities
   * @request PUT:/api/v2/experiment/alerts/template
   * @responses <br/>
   *  **200** V2ExperimentAlertsTemplateUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v2ExperimentAlertsTemplateUpdate = (
    query: V2ExperimentAlertsTemplateUpdateParamsDC,
    request: RequestsChangeAlertSeveritiesBodyDC,
    params: RequestParams = {},
  ) =>
    http.request<
      V2ExperimentAlertsTemplateUpdateDataDC,
      V2ExperimentAlertsTemplateUpdateErrorDC
    >({
      path: `${
        buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl
      }/api/v2/experiment/alerts/template`,
      method: 'PUT',
      query: query,
      body: request,
      type: ContentType.Json,
      ...params,
    });
})();
