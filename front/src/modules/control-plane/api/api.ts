import { createEffect } from 'effector';

import { controlPlaneApi } from '@/modules/control-plane/shared/api';
import { ContentType } from '@/shared/api/common/http-client';
import { apiUrl, http } from '@/shared/api/http';

const oauthUrl = `${buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl}/auth/authorize`;

export const authorizeFx = createEffect(() => {
  window.location.href = oauthUrl + `?redirect_url=${window.location.href}`;
});

export const exchangeTokenFx = createEffect<
  { code: string; redirect_uri: string },
  controlPlaneApi.dc.TokenListDataDC,
  Error
>(async ({ code, redirect_uri }) => {
  const response = await controlPlaneApi.oauth.tokenList({
    code,
    redirect_uri,
  });

  return response.data ?? {};
});

export const loginFx = createEffect<
  { username: string; password: string },
  controlPlaneApi.dc.TokenListDataDC,
  Error
>(async (body) => {
  const response = await http.request<
    controlPlaneApi.dc.TokenListDataDC,
    controlPlaneApi.dc.TokenListErrorDC
  >({
    path: `${buildEnvs.MODULES['control-plane']?.apiUrl || apiUrl}/auth/login`,
    method: 'POST',
    type: ContentType.Json,
    body,
  });

  return response.data ?? {};
});
