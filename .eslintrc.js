module.exports = {
    root: true,
    env: {
      browser: false,
      node: true,
    },
    parserOptions: {
      parser: 'babel-eslint',
    },
    extends: ['standard', 'prettier', 'plugin:prettier/recommended'],
    plugins: ['prettier', 'markdown'],
    // add your custom rules here
    rules: {},
  }