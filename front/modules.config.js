/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

/**
 * Конфигурация модуля
 * @typedef {Object} ModuleConfig
 * @property {string} name
 * @property {string?} apiUrl
 * @property {string?} directoryAlias - директория в которой находится код фронтенда модуля
 * @property {string?} swaggerUrl
 * @property {string?} proxySocks5Tunnel
 */

/**
 *
 * @type {ModuleConfig[]}
 */
const moduleConfigs = [
  {
    name: 'stream-flow',
    apiUrl: process.env.SF_API_URL,
    swaggerUrl: process.env.SF_SWAGGER_URL,
    proxySocks5Tunnel: process.env.SF_SOCKS5_SSH_TUNNEL,
  },
];

module.exports = {
  moduleConfigs,
};
