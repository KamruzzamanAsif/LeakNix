module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'max-len': 0,
    indent: 0,
    'import/no-extraneous-dependencies': 0,
    'comma-dangle': 0,
    'func-names': 0,
    'no-shadow': 0,
    'no-unused-expressions': 0,
    'no-param-reassign': 0,
    'no-use-before-define': 0,
    'global-require': 0,
    'no-underscore-dangle': 0,
    'import/prefer-default-export': 0,
    'no-plusplus': 0,
    'arrow-body-style': 0,
    'object-shorthand': 0,
    'lines-between-class-members': 0,
    'no-dupe-class-members': 0,
    'no-useless-return': 0,
    'no-lonely-if': 0,
    'function-call-argument-newline': 0,
    'function-paren-newline': 0
  },
};
