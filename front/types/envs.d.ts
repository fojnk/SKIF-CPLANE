declare interface BuildEnvVariables {
  VERSION: string;
  BUILD_DATE: string;
  DEV: boolean;
  BASE_URL: string;
  /* оригинальный адрес бэкенд апи для запросов */
  API_URL?: string;
  PREVIEW: boolean;
  POLYFILLS: {
    RESIZE_OBSERVER: boolean;
  };
  MODULES: Record<string, { apiUrl?: string } | undefined>;
  PROXY: null | {
    API_URL: string;
    PREFIXES: Record<string, string>;
    REPLACEMENT_REDIRECT_URL_FROM?: string;
    REPLACEMENT_REDIRECT_URL_TO?: string;
    REPLACEMENT_AUTH_URL_FROM?: string;
    REPLACEMENT_AUTH_URL_TO?: string;
  };
}

declare interface SharedEnvVariables {
  apiUrl?: string;
}

declare const buildEnvs: BuildEnvVariables;

interface Window {
  sharedEnvs?: SharedEnvVariables;
}
