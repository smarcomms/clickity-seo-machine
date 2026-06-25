const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');

const globals = {
  // Node.js globals
  AbortController: 'readonly',
  Buffer: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  clearInterval: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
  global: 'readonly',
  process: 'readonly',
  setInterval: 'readonly',
  setTimeout: 'readonly',
  module: 'writable',
  require: 'readonly',
  // Browser globals
  document: 'readonly',
  fetch: 'readonly',
  navigator: 'readonly',
  window: 'readonly',
  Headers: 'readonly',
  Response: 'readonly',
  Request: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  // React globals
  React: 'readonly',
  JSX: 'readonly',
};

module.exports = [
  {
    ignores: ['node_modules/', '.next/', '.vercel/', 'out/', 'dist/', 'check-run.js'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals,
    },
    rules: {
      'no-unused-vars': 'off',
      'preserve-caught-error': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals,
    },
  },
];
