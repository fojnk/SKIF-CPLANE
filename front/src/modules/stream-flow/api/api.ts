import { createEffect } from 'effector';

import { streamFlowApi } from '@/modules/stream-flow/shared/api';
import { ContentType } from '@/shared/api/common/http-client';
import { apiUrl, http } from '@/shared/api/http';

const oauthUrl = `${buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl}/auth/authorize`;

export const authorizeFx = createEffect(() => {
  window.location.href = oauthUrl + `?redirect_url=${window.location.href}`;
});

export const exchangeTokenFx = createEffect<
  { code: string; redirect_uri: string },
  streamFlowApi.dc.TokenListDataDC,
  Error
>(async ({ code, redirect_uri }) => {
  const response = await streamFlowApi.oauth.tokenList({
    code,
    redirect_uri,
  });

  return response.data ?? {};
});

export const loginFx = createEffect<
  { username: string; password: string },
  streamFlowApi.dc.TokenListDataDC,
  Error
>(async (body) => {
  const response = await http.request<
    streamFlowApi.dc.TokenListDataDC,
    streamFlowApi.dc.TokenListErrorDC
  >({
    path: `${buildEnvs.MODULES['stream-flow']?.apiUrl || apiUrl}/auth/login`,
    method: 'POST',
    type: ContentType.Json,
    body,
  });

  return response.data ?? {};
});
