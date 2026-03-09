/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
const _ = require('lodash');
const { generateApi: generateCodeGenApi } = require('swagger-typescript-api');
const { CodeGenConfig } = require('swagger-typescript-api/src/configuration');
const { FileSystem } = require('swagger-typescript-api/src/util/file-system');
const { Logger } = require('swagger-typescript-api/src/util/logger');

const { resolve } = require('path');

const { CODEGEN_API_CONFIGS, SKIP_API_FILES } = require('./config');

/**
 * @type {import('swagger-typescript-api').GenerateApiParams}
 */
const codeGenConfig = {
  httpClientType: 'fetch',
  cleanOutput: true,
  modular: true,
  patch: true,
  typeSuffix: 'DC',
  disableStrictSSL: true,
  singleHttpClient: true,
  extractRequestBody: true,
  extractRequestParams: true,
  extractResponseBody: true,
  extractResponseError: true,
  generateResponses: true,
  generateClient: true,
  addReadonly: true,
  moduleNameFirstTag: true,
  sortTypes: true,
  requestOptions: process.env.GITLAB_TOKEN
    ? {
        headers: {
          'PRIVATE-TOKEN': process.env.GITLAB_TOKEN,
        },
      }
    : undefined,
  sortRoutes: true,
  primitiveTypeConstructs: (constructs) => {
    return {
      ...constructs,
      object: () => `{}`,
    };
  },
  hooks: {
    onCreateRoute: (route) => {
      if (route.raw['x-scope'] === 'hidden') return false;
    },
    onFormatRouteName: (routeInfo, templateRouteName) => {
      if (!routeInfo.operationId) {
        const tempOperationId = _.camelCase(
          `${routeInfo.method}_${_.last(routeInfo.route.split('/'))}`,
        );

        console.warn('operation id is not setted for', routeInfo);

        return tempOperationId;
      }

      if (routeInfo.operationId.includes('.')) {
        const fixedOperationId = routeInfo.operationId.split('.', 2)[1];
        return _.camelCase(fixedOperationId);
      }

      return templateRouteName;
    },
  },
};

async function generateApi({
  url,
  path,
  output: outputDir,
  apiName,
  fs,
  baseApiUrl,
}) {
  const templatesDir = resolve(__dirname, './templates');

  let { files: apiFiles } = await generateCodeGenApi({
    ...codeGenConfig,
    templates: templatesDir,
    ...(url ? { url } : { input: path }),
    hooks: {
      ...codeGenConfig,
      onPrepareConfig: (config) => {
        if (baseApiUrl) {
          config.config.baseApiUrl = baseApiUrl;
        }
        return codeGenConfig.hooks?.onPrepareConfig?.(config);
      },
    },
  });

  apiFiles = apiFiles
    .filter((file) => !SKIP_API_FILES.includes(file.fileName))
    .map((file) => {
      return { ...file, fileName: _.kebabCase(file.fileName) };
    });

  fs.cleanDir(outputDir);

  apiFiles.forEach((file) => {
    fs.createFile({
      path: outputDir,
      content: file.fileContent,
      fileName: `${file.fileName}${file.fileExtension}`,
      withPrefix: true,
    });
  });

  fs.createFile({
    path: outputDir,
    content: `
export * as dc from "./data-contracts";
${apiFiles
  .map((file) => {
    if (file.fileName === 'data-contracts') return '';
    const apiObjectName = _.camelCase(file.fileName) + 'Api';
    const exportableName = _.camelCase(file.fileName);
    return `export { ${apiObjectName} as ${exportableName} } from "./${file.fileName}";`;
  })
  .join('\n')}    
`,
    fileName: `__acc.ts`,
    withPrefix: true,
  });

  fs.createFile({
    path: outputDir,
    content: `
import * as ${_.camelCase(apiName) + 'Api'} from "./__acc";

export { ${_.camelCase(apiName) + 'Api'} }
`,
    fileName: `index.ts`,
    withPrefix: true,
  });
}

const run = async () => {
  const logger = new Logger({
    config: new CodeGenConfig({
      ...codeGenConfig,
    }),
  });

  const fs = new FileSystem({ logger });

  for await (const config of CODEGEN_API_CONFIGS) {
    await generateApi({ ...config, fs });
  }

  //   fs.createFile({
  //     path: rootGenerateOutputDir,
  //     content: `
  // ${configs
  //   .map((config) => {
  //     if (config.apiName === 'data-contracts') return '';
  //     return `export * from "./${config.apiName}";`;
  //   })
  //   .join('\n')}
  // `,
  //     fileName: `index.ts`,
  //     withPrefix: true,
  //   });
};

run();
