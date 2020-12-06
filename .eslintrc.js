module.exports = {
    parser: 'babel-eslint',
    extends: ['standard', 'plugin:react/recommended', 'plugin:react-native-a11y/ios'],
    rules: {
      camelcase: 0,
      indent: 0,
      'react/react-in-jsx-scope': 0,
      'react/display-name': 0,
      'react/jsx-no-undef': [2, { allowGlobals: true }],
      'react/prop-types': 1,
      'react/no-deprecated': 0,
      'object-curly-spacing': 0,
      semi: 0,
      'prefer-const': 0,
      'quote-props': 0,
      'dot-notation': 0,
      'no-prototype-builtins': 0
    },
    env: {
      jest: true
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
