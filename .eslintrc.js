module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended', '@leyan/eslint-config-base'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'no-angle-bracket-type-assertion': false,
    'no-await-in-loop': [0],
    'global-require': [0],
    'no-restricted-syntax': [0],
    'no-param-reassign': [0],
    'import/no-dynamic-require': [0],
  },
};
