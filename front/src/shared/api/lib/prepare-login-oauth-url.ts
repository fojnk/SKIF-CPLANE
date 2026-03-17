import { apiUrl } from '@/shared/api';

export const prepareLoginOauthUrl = (loginUrl: string) => {
  if (buildEnvs.PROXY) {
    const replacementPrefix = {
      api: {
        from: buildEnvs.PROXY.REPLACEMENT_REDIRECT_URL_FROM,
        to:
          buildEnvs.PROXY.API_URL &&
          buildEnvs.PROXY.PREFIXES['oneui'] &&
          `${apiUrl}${buildEnvs.PROXY.API_URL}${buildEnvs.PROXY.PREFIXES['oneui']}`,
      },
      auth: {
        from: buildEnvs.PROXY.REPLACEMENT_AUTH_URL_FROM,
        to: buildEnvs.PROXY.REPLACEMENT_AUTH_URL_TO,
      },
    };

    if (replacementPrefix.api.from && replacementPrefix.api.to) {
      loginUrl = loginUrl.replace(
        encodeURIComponent(replacementPrefix.api.from),
        encodeURIComponent(replacementPrefix.api.to),
      );
    }

    if (replacementPrefix.auth.from && replacementPrefix.auth.to) {
      loginUrl = loginUrl.replace(
        encodeURIComponent(replacementPrefix.auth.from),
        encodeURIComponent(replacementPrefix.auth.to),
      );
    }
  }

  return loginUrl;
};
