/* eslint-disable import/no-internal-modules,@typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any,prettier/prettier */
import viteLegacyPlugin from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react-swc';
import browserslist from 'browserslist';
import dotenv from 'dotenv';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { defineConfig, ProxyOptions, loadEnv } from 'vite';
import { default as checker } from 'vite-plugin-checker';
import { createHtmlPlugin as html } from 'vite-plugin-html';
import svgr from 'vite-plugin-svgr';

import path from 'path';

import { serverConfigureVitePlugin } from './build/server-configure-vite-plugin';
import { checkFeatureSupport } from './build/utils/check-feature-support';
import { getBrowsers } from './build/utils/get-browsers';
import { moduleConfigs } from './modules.config.js';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const disableBuildChecks =
  process.env.DISABLE_BUILD_CHECKS === 'true' ||
  process.env.DISABLE_BUILD_CHECKS === '1';
const lightweightBuild =
  process.env.LIGHTWEIGHT_BUILD === 'true' ||
  process.env.LIGHTWEIGHT_BUILD === '1';
const disableLegacyBuild =
  process.env.DISABLE_LEGACY_BUILD === 'true' ||
  process.env.DISABLE_LEGACY_BUILD === '1';

const browserTargets = browserslist.loadConfig({
  path: path.resolve(__dirname),
});

const baseUrl = process.env.PUBLIC_URL || '/';
const isPreview = process.env.MODE === 'preview';
const port = +process.env.PORT || 8081;

console.info('BROWSERS SUPPORT: ');
console.info(
  getBrowsers(browserTargets)
    .browsers.map((browser) => {
      const versions = Object.keys(browser.versions)
        .map((v) => +v.split('-')[0])
        .filter(Boolean)
        .sort((a, b) => a - b);

      return `${browser.name}:${versions[0] ? ` ${versions[0]}+` : ''
        } (coverage: ${browser.coverage} %)`;
    })
    .join('\n'),
);

const getApiUrls = () => {
  const api: string | undefined = process.env.CP_API_URL;

  return { api };
};

const getBuildEnvs = (): BuildEnvVariables => {
  const apiUrls = getApiUrls();

  const proxyConfig: Maybe<BuildEnvVariables['PROXY']> =
    process.env.PROXY === 'true' || process.env.PROXY === '1'
      ? {
        API_URL: process.env.PROXY_API_PREFIX || `/_proxy-api_`,
        PREFIXES: moduleConfigs.reduce<Record<string, string>>(
          (prefixes, moduleConfig) => {
            prefixes[moduleConfig.name] = `/__${moduleConfig.name}`;
            return prefixes;
          },
          {},
        ),
        REPLACEMENT_REDIRECT_URL_FROM:
          process.env.PROXY_REPLACEMENT_REDIRECT_URL_FROM,
        REPLACEMENT_AUTH_URL_FROM:
          process.env.PROXY_REPLACEMENT_AUTH_URL_FROM,
        REPLACEMENT_REDIRECT_URL_TO:
          process.env.PROXY_REPLACEMENT_REDIRECT_URL_TO,
        REPLACEMENT_AUTH_URL_TO: process.env.PROXY_REPLACEMENT_AUTH_URL_TO,
      }
      : null;

  const buildDate = new Date();
  const buildTime = buildDate.toLocaleTimeString();
  const buildDay = buildDate.toLocaleDateString();

  return {
    VERSION: `${process.env.VITE_GIT_MERGE}.${process.env.VITE_GIT_COMMITS} (${process.env.VITE_GIT_HASH})`,
    BUILD_DATE: `${buildTime}, ${buildDay}`,
    DEV: !isProd,
    BASE_URL: process.env.PUBLIC_URL || '/',
    API_URL: apiUrls.api,
    PREVIEW: isPreview,
    POLYFILLS: {
      RESIZE_OBSERVER: !checkFeatureSupport('resizeobserver', browserTargets),
    },
    MODULES: moduleConfigs.reduce(
      (acc: BuildEnvVariables['MODULES'], moduleConfig) => {
        let apiUrl = moduleConfig.apiUrl;

        if (proxyConfig?.PREFIXES[moduleConfig.name]) {
          apiUrl = `${proxyConfig.API_URL}${proxyConfig.PREFIXES[moduleConfig.name]}`;
        }

        acc[moduleConfig.name] = {
          apiUrl,
        };

        return acc;
      },
      {} as BuildEnvVariables['MODULES'],
    ),
    PROXY: proxyConfig,
  };
};

const buildEnvs = getBuildEnvs();

const createProxyConfig = (cfg: {
  sshTunnel?: string;
  proxyUrl?: Maybe<string>;
  targetUrl?: Maybe<string>;
}): Record<string, ProxyOptions> => {
  if (!cfg.proxyUrl || !cfg.targetUrl) return {};

  const proxy: Record<string, ProxyOptions> = {};

  proxy[cfg.proxyUrl] = {
    agent: cfg.sshTunnel
      ? new SocksProxyAgent(`socks://${cfg.sshTunnel}`)
      : undefined,
    secure: false,
    cookieDomainRewrite: 'localhost',
    changeOrigin: true,
    autoRewrite: true,
    protocolRewrite: 'http',
    ws: true,
    target: `${cfg.targetUrl}`,
    rewrite: (path) => path.replace(new RegExp(`^(${cfg.proxyUrl})`), ''),
  };

  return proxy;
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    appType: 'spa',
    mode: isProd ? 'production' : 'development',
    base: baseUrl,
    clearScreen: true,
    define: {
      ...Object.entries(buildEnvs).reduce<Record<string, any>>((acc, entry) => {
        acc[`buildEnvs.${entry[0]}`] = JSON.stringify(entry[1]);
        return acc;
      }, {}),
    },
    server: {
      port,
      hmr: true,
      cors: false,
      proxy: buildEnvs.PROXY
        ? {
          ...createProxyConfig({
            proxyUrl: process.env.PROXY_REPLACEMENT_REDIRECT_URL_TO,
            targetUrl: process.env.PROXY_REPLACEMENT_REDIRECT_URL_FROM,
          }),
          ...createProxyConfig({
            proxyUrl: process.env.PROXY_REPLACEMENT_AUTH_URL_TO,
            targetUrl: process.env.PROXY_REPLACEMENT_AUTH_URL_FROM,
          }),
          ...Object.assign(
            {},
            ...moduleConfigs.map((moduleConfig) =>
              createProxyConfig({
                proxyUrl: `${buildEnvs.PROXY.API_URL}${buildEnvs.PROXY.PREFIXES[moduleConfig.name]}`,
                targetUrl: moduleConfig.apiUrl,
                sshTunnel: moduleConfig.proxySocks5Tunnel,
              }),
            ),
          ),
        }
        : {},
    },
    preview: {
      port,
    },
    resolve: {
      alias: [{ find: '@', replacement: '/src' }],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'effector',
        'effector-react',
        '@gravity-ui/uikit',
        '@gravity-ui/icons',
      ],
      exclude: [
        'monaco-editor',
        '@monaco-editor/react',
      ],
      force: false, // Не принудительная пересборка при каждом старте
    },
    cacheDir: 'node_modules/.vite', // Явно указываем директорию кеша
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: ``,
        },
      },
      modules: {
        localsConvention: 'camelCaseOnly',
        generateScopedName: isProd
          ? '[hash:base64:4]'
          : '[name]__[local]___[hash:base64:5]',
      },
    },
    build: {
      cssCodeSplit: true,
      reportCompressedSize: !lightweightBuild,
      emptyOutDir: true,
      minify: isProd,
      cssMinify: isProd,
      cssTarget: false,
      ssrEmitAssets: false,
      ssrManifest: false,
      ssr: false,
      rollupOptions: {
        maxParallelFileOps: lightweightBuild ? 20 : 100,
        cache: !isProd,
        output: {
          entryFileNames: 'static/js/bundle.[hash].js',
          assetFileNames: 'static/assets/[name].[hash].[ext]',
          chunkFileNames: 'static/js/[name].[hash].js',
        },
      },
    },
    plugins: [
      isProd &&
      !disableLegacyBuild &&
      viteLegacyPlugin({
        targets: browserTargets,
        modernPolyfills: [
          'es/object/from-entries',
          !checkFeatureSupport('array-flat', browserTargets) &&
          'es/array/flat',
        ].filter(Boolean),
        polyfills: [
          'es/object/from-entries',
          !checkFeatureSupport('array-flat', browserTargets) &&
          'es/array/flat',
        ].filter(Boolean),
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      }),
      svgr({}),
      react(),
      isProd &&
      !disableBuildChecks &&
      checker({
        typescript: true,
        overlay: true,
        eslint: isProd
          ? {
            lintCommand: 'eslint -c .eslintrc.js "src/**/*.{ts,tsx}"',
          }
          : false,
      }),
      html({
        minify: isProd,
      }),
      (!isProd || isPreview) && serverConfigureVitePlugin(),
    ].filter(Boolean),
  };
});
