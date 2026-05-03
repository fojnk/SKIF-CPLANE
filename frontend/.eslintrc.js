/* eslint-env node */
const path = require('path');

module.exports = {
  root: true,
  ignorePatterns: [
    'dist',
    'node_modules',
    'build',
    '**/__generated__/**',
    '*.config.ts',
    '*.config.js',
    '.eslintrc.js',
    'api-codegenerator/**/*.js',
    'src/**/*.worker.js',
    '**/timer-worker.js',
  ],
  env: {
    browser: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'effector'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: { project: path.resolve(__dirname, 'tsconfig.json') },
      alias: {
        map: [['@', path.resolve(__dirname, 'src')]],
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
};
