/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

const { resolve } = require('path');

const { moduleConfigs } = require('../modules.config');

const srcDir = resolve(__dirname, '../src');

const configs = moduleConfigs
  .filter((moduleConfig) => moduleConfig.swaggerUrl)
  .map((moduleConfig) => {
    return {
      url: moduleConfig.swaggerUrl,
      output: resolve(
        srcDir,
        `./modules/${moduleConfig.directoryAlias || moduleConfig.name}/shared/api/__generated__`,
      ),
      apiName: moduleConfig.name,
      baseApiUrl: `buildEnvs.MODULES['${moduleConfig.name}']?.apiUrl`,
    };
  });

const SKIP_API_FILES = ['http-client'];

module.exports = {
  SKIP_API_FILES,
  SRC_DIR: srcDir,
  CODEGEN_API_CONFIGS: configs,
};
