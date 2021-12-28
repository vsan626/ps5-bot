module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module'
  },
  rules: {
    quotes: [1, 'single', { avoidEscape: true }],
    'comma-dangle': [1, 'never'],
    'no-unused-vars': 'off',
    'no-console': 'off'
  }
};
