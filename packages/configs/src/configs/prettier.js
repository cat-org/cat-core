// @flow

export default {
  install: (install: $ReadOnlyArray<string>) => [...install, 'prettier'],
  config: () => ({
    singleQuote: true,
    trailingComma: 'all',
  }),
  ignore: () => ({
    name: '.prettierignore',
  }),
  run: (argv: $ReadOnlyArray<string>) => [...argv, '--write'],
  configsFiles: {
    prettier: '.prettierrc.js',
  },
};