const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const normalize = require('postcss-normalize');

module.exports = {
  syntax: 'postcss-scss',
  plugins: [
    require('postcss-import')(),
    require('postcss-calc')(),
    require('@minko-fe/postcss-pxtorem')({
      rootValue: 16,
      unitPrecision: 8,
      propList: ['*', '!border', '!border-*', '!*-px'],
      selectorBlackList: ['html'],
    }),
    normalize,
    autoprefixer,
    process.env.NODE_ENV === 'production' &&
      cssnano({
        preset: [
          'default',
          {
            autoprefixer: false,
            // discardEmpty: false,
            // discardDuplicates: false,
            // discardOverridden: false,
            // mergeLonghand: false,
            mergeRules: false,
            zindex: false,
            discardComments: {
              removeAll: true,
            },
          },
        ],
      }),
  ].filter(Boolean),
};
