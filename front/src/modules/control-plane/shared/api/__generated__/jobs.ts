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
  RequestsListJobsRequestDC,
  V1EventsListDataDC,
  V1EventsListErrorDC,
  V1EventsListParamsDC,
  V1JobEventsListDataDC,
  V1JobEventsListErrorDC,
  V1JobEventsListParamsDC,
  V1JobListDataDC,
  V1JobListErrorDC,
  V1JobListParamsDC,
  V1JobTasksListDataDC,
  V1JobTasksListErrorDC,
  V1JobTasksListParamsDC,
  V1JobsSearchCreateDataDC,
  V1JobsSearchCreateErrorDC,
} from './data-contracts';
export const jobsApi = new (class JobsApi {
  /**
   * No description
   *
   * @tags jobs
   * @summary get events for all jobs with filters
   * @request GET:/api/v1/events
   * @responses <br/>
   *  **200** V1EventsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   *  **503** ResponsesErrorResponseDC Service Unavailable <br/>
   */
  v1EventsList = (query: V1EventsListParamsDC, params: RequestParams = {}) =>
    http.request<V1EventsListDataDC, V1EventsListErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/events`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags jobs
   * @summary get events for a specific job
   * @request GET:/api/v1/job/events
   * @responses <br/>
   *  **200** V1JobEventsListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   *  **503** ResponsesErrorResponseDC Service Unavailable <br/>
   */
  v1JobEventsList = (
    query: V1JobEventsListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1JobEventsListDataDC, V1JobEventsListErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/job/events`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags jobs
   * @summary get job by ID
   * @request GET:/api/v1/job
   * @responses <br/>
   *  **200** V1JobListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   *  **503** ResponsesErrorResponseDC Service Unavailable <br/>
   */
  v1JobList = (query: V1JobListParamsDC, params: RequestParams = {}) =>
    http.request<V1JobListDataDC, V1JobListErrorDC>({
      path: `${buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl}/api/v1/job`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags jobs
   * @summary search and list jobs with filters
   * @request POST:/api/v1/jobs/search
   * @responses <br/>
   *  **200** V1JobsSearchCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   *  **503** ResponsesErrorResponseDC Service Unavailable <br/>
   */
  v1JobsSearchCreate = (
    request: RequestsListJobsRequestDC,
    params: RequestParams = {},
  ) =>
    http.request<V1JobsSearchCreateDataDC, V1JobsSearchCreateErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/jobs/search`,
      method: 'POST',
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags jobs
   * @summary get tasks for a specific job
   * @request GET:/api/v1/job/tasks
   * @responses <br/>
   *  **200** V1JobTasksListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   *  **503** ResponsesErrorResponseDC Service Unavailable <br/>
   */
  v1JobTasksList = (
    query: V1JobTasksListParamsDC,
    params: RequestParams = {},
  ) =>
    http.request<V1JobTasksListDataDC, V1JobTasksListErrorDC>({
      path: `${
        buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl
      }/api/v1/job/tasks`,
      method: 'GET',
      query: query,
      type: ContentType.Json,
      ...params,
    });
})();
