module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: 'airbnb-base',
  rules: {
    // require or disallow trailing commas (comma-dangle)
    'comma-dangle': ['error', 'never'],

    //Require parens in arrow function arguments (arrow-parens)
    'arrow-parens': ['error', 'as-needed'],

    // Require Radix Parameter (radix)
    radix: ['error', 'as-needed'],

    // disallow the use of console (no-console)
    'no-console': ['error', { allow: ['info', 'warn', 'error'] } ]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
};
