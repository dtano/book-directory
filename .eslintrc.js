module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
  },
  'extends': [
    'plugin:react/recommended',
    'google',
  ],
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
    'ecmaVersion': 'latest',
  },
  'plugins': [
    'react',
  ],
  'rules': {
    'linebreak-style': [2, 'windows'],
    'require-jsdoc': 0,
    'max-len': 0,
    'arrow-parens': 0,
    'new-cap': 0,
  },
};
