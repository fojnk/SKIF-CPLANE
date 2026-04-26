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
  RequestsCreateAppBannerRequestDC,
  RequestsCreateAppUpdateRequestDC,
  RequestsDeleteAppBannerRequestDC,
  RequestsDeleteAppUpdateRequestDC,
  RequestsUpdateAppAboutRequestDC,
  RequestsUpdateAppBannerRequestDC,
  RequestsUpdateAppUpcomingRequestDC,
  RequestsUpdateAppUpdateRequestDC,
  V1AppAboutListDataDC,
  V1AppAboutListErrorDC,
  V1AppAboutUpdateDataDC,
  V1AppAboutUpdateErrorDC,
  V1AppBannerCreateDataDC,
  V1AppBannerCreateErrorDC,
  V1AppBannerDeleteDataDC,
  V1AppBannerDeleteErrorDC,
  V1AppBannerListDataDC,
  V1AppBannerListErrorDC,
  V1AppBannerListParamsDC,
  V1AppBannerTypesListDataDC,
  V1AppBannerTypesListErrorDC,
  V1AppBannerUpdateDataDC,
  V1AppBannerUpdateErrorDC,
  V1AppBannersCurrentListDataDC,
  V1AppBannersCurrentListErrorDC,
  V1AppBannersListDataDC,
  V1AppBannersListErrorDC,
  V1AppIsAdminListDataDC,
  V1AppIsAdminListErrorDC,
  V1AppUpcomingListDataDC,
  V1AppUpcomingListErrorDC,
  V1AppUpcomingUpdateDataDC,
  V1AppUpcomingUpdateErrorDC,
  V1AppUpdateCreateDataDC,
  V1AppUpdateCreateErrorDC,
  V1AppUpdateDeleteDataDC,
  V1AppUpdateDeleteErrorDC,
  V1AppUpdateListDataDC,
  V1AppUpdateListErrorDC,
  V1AppUpdateListParamsDC,
  V1AppUpdateUpdateDataDC,
  V1AppUpdateUpdateErrorDC,
  V1AppUpdatesListDataDC,
  V1AppUpdatesListErrorDC,
  V1AppUpdatesListParamsDC,
} from "./data-contracts";
export const appApi = new (class AppApi {
  /**
   * No description
   *
   * @tags app
   * @summary get app about content
   * @request GET:/api/v1/app/about
   * @responses <br/>
   *  **200** V1AppAboutListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppAboutList = (params: RequestParams = {}) =>
    http.request<V1AppAboutListDataDC, V1AppAboutListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/about`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary update app about content
   * @request PUT:/api/v1/app/about
   * @responses <br/>
   *  **200** V1AppAboutUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppAboutUpdate = (request: RequestsUpdateAppAboutRequestDC, params: RequestParams = {}) =>
    http.request<V1AppAboutUpdateDataDC, V1AppAboutUpdateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/about`,
      method: "PUT",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary create app banner
   * @request POST:/api/v1/app/banner
   * @responses <br/>
   *  **200** V1AppBannerCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppBannerCreate = (request: RequestsCreateAppBannerRequestDC, params: RequestParams = {}) =>
    http.request<V1AppBannerCreateDataDC, V1AppBannerCreateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/banner`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary delete app banner
   * @request DELETE:/api/v1/app/banner
   * @responses <br/>
   *  **200** V1AppBannerDeleteDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppBannerDelete = (request: RequestsDeleteAppBannerRequestDC, params: RequestParams = {}) =>
    http.request<V1AppBannerDeleteDataDC, V1AppBannerDeleteErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/banner`,
      method: "DELETE",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary get app banner info
   * @request GET:/api/v1/app/banner
   * @responses <br/>
   *  **200** V1AppBannerListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppBannerList = (query: V1AppBannerListParamsDC, params: RequestParams = {}) =>
    http.request<V1AppBannerListDataDC, V1AppBannerListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/banner`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary get current active app banner
   * @request GET:/api/v1/app/banners/current
   * @responses <br/>
   *  **200** V1AppBannersCurrentListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppBannersCurrentList = (params: RequestParams = {}) =>
    http.request<V1AppBannersCurrentListDataDC, V1AppBannersCurrentListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/banners/current`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary list app banners
   * @request GET:/api/v1/app/banners
   * @responses <br/>
   *  **200** V1AppBannersListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppBannersList = (params: RequestParams = {}) =>
    http.request<V1AppBannersListDataDC, V1AppBannersListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/banners`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary get app banner types
   * @request GET:/api/v1/app/banner/types
   * @responses <br/>
   *  **200** V1AppBannerTypesListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppBannerTypesList = (params: RequestParams = {}) =>
    http.request<V1AppBannerTypesListDataDC, V1AppBannerTypesListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/banner/types`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary update app banner
   * @request PUT:/api/v1/app/banner
   * @responses <br/>
   *  **200** V1AppBannerUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppBannerUpdate = (request: RequestsUpdateAppBannerRequestDC, params: RequestParams = {}) =>
    http.request<V1AppBannerUpdateDataDC, V1AppBannerUpdateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/banner`,
      method: "PUT",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary check if user is admin
   * @request GET:/api/v1/app/is-admin
   * @responses <br/>
   *  **200** V1AppIsAdminListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppIsAdminList = (params: RequestParams = {}) =>
    http.request<V1AppIsAdminListDataDC, V1AppIsAdminListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/is-admin`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary get app upcoming content
   * @request GET:/api/v1/app/upcoming
   * @responses <br/>
   *  **200** V1AppUpcomingListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppUpcomingList = (params: RequestParams = {}) =>
    http.request<V1AppUpcomingListDataDC, V1AppUpcomingListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/upcoming`,
      method: "GET",
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary update app upcoming content
   * @request PUT:/api/v1/app/upcoming
   * @responses <br/>
   *  **200** V1AppUpcomingUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppUpcomingUpdate = (request: RequestsUpdateAppUpcomingRequestDC, params: RequestParams = {}) =>
    http.request<V1AppUpcomingUpdateDataDC, V1AppUpcomingUpdateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/upcoming`,
      method: "PUT",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary create app update
   * @request POST:/api/v1/app/update
   * @responses <br/>
   *  **200** V1AppUpdateCreateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppUpdateCreate = (request: RequestsCreateAppUpdateRequestDC, params: RequestParams = {}) =>
    http.request<V1AppUpdateCreateDataDC, V1AppUpdateCreateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/update`,
      method: "POST",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary delete app update
   * @request DELETE:/api/v1/app/update
   * @responses <br/>
   *  **200** V1AppUpdateDeleteDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppUpdateDelete = (request: RequestsDeleteAppUpdateRequestDC, params: RequestParams = {}) =>
    http.request<V1AppUpdateDeleteDataDC, V1AppUpdateDeleteErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/update`,
      method: "DELETE",
      body: request,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary get app update info
   * @request GET:/api/v1/app/update
   * @responses <br/>
   *  **200** V1AppUpdateListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppUpdateList = (query: V1AppUpdateListParamsDC, params: RequestParams = {}) =>
    http.request<V1AppUpdateListDataDC, V1AppUpdateListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/update`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary list all app updates
   * @request GET:/api/v1/app/updates
   * @responses <br/>
   *  **200** V1AppUpdatesListDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppUpdatesList = (query: V1AppUpdatesListParamsDC, params: RequestParams = {}) =>
    http.request<V1AppUpdatesListDataDC, V1AppUpdatesListErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/updates`,
      method: "GET",
      query: query,
      ...params,
    });
  /**
   * No description
   *
   * @tags app
   * @summary update app update
   * @request PUT:/api/v1/app/update
   * @responses <br/>
   *  **200** V1AppUpdateUpdateDataDC OK <br/>
   *  **400** ResponsesErrorResponseDC Bad Request <br/>
   *  **401** ResponsesErrorResponseDC Unauthorized <br/>
   *  **403** ResponsesErrorResponseDC Forbidden <br/>
   *  **404** ResponsesErrorResponseDC Not Found <br/>
   *  **500** ResponsesErrorResponseDC Internal server error <br/>
   */
  v1AppUpdateUpdate = (request: RequestsUpdateAppUpdateRequestDC, params: RequestParams = {}) =>
    http.request<V1AppUpdateUpdateDataDC, V1AppUpdateUpdateErrorDC>({
      path: `${buildEnvs.MODULES["control-plane"]?.apiUrl || apiUrl}/api/v1/app/update`,
      method: "PUT",
      body: request,
      type: ContentType.Json,
      ...params,
    });
})();
