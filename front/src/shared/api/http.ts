import { createEvent } from 'effector';

import { HttpClient, HttpResponse, isHttpResponse } from '@/shared/api';

export const apiUrl = `${location.protocol}//${location.host}`;

export const httpRequestFailed = createEvent<HttpResponse<unknown>>();

export const http = new HttpClient<unknown>({
  baseApiParams: {
    format: 'json',
  },
  customFetch: async (...params) => {
    try {
      const response = await fetch(...params);
      if (!response.ok) {
        if (isHttpResponse(response)) {
          httpRequestFailed(response);
        }
        return Promise.reject(response);
      }
      return response;
    } catch (e) {
      return Promise.reject(e);
    }
  },
});

export const setHttpSecurityData = createEvent<unknown | null>();

setHttpSecurityData.watch((token) => http.setSecurityData(token));
