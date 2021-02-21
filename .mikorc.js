// @flow

/* eslint-disable flowtype/require-return-type */
/* eslint-disable flowtype/require-parameter-type */
/* eslint-disable jsdoc/require-jsdoc */

const babel = ({ presets, plugins, ...config }) => {
  if (!process.env.USE_DEFAULT_BABEL) {
    const basePreset = presets.find(preset => preset[0] === '@mikojs/base');

    basePreset[1]['@mikojs/transform-flow'] = {
      ...basePreset[1]['@mikojs/transform-flow'],
      plugins: [['@babel/proposal-pipeline-operator', { proposal: 'minimal' }]],
    };
  }

  return {
    ...config,
    presets,
    plugins: [
      ...plugins,
      'add-module-exports',
      ['@babel/proposal-pipeline-operator', { proposal: 'minimal' }],
      [
        'transform-imports',
        {
          '@mikojs/utils': {
            transform: '@mikojs/utils/lib/${member}',
          },
          fbjs: {
            transform: 'fbjs/lib/${member}',
          },
          validator: {
            transform: 'validator/lib/${member}',
          },
        },
      ],
    ],
  };
};

const lint = {
  config: ({ ignorePatterns, ...config }) => ({
    ...config,
    globals: {
      __MIKOJS_DATA__: true,
    },
    overrides: [
      {
        files: ['__mocks__/**'],
        rules: {
          'import/no-extraneous-dependencies': 'off',
        },
      },
    ],
    ignorePatterns: [
      ...ignorePatterns,
      // ignore for @mikojs/eslint-config-base testing
      'packages/eslint-config-base/src/__tests__/__ignore__',
    ],
  }),
};

const jest = ({ collectCoverageFrom, ...config }) => ({
  ...config,
  collectCoverageFrom: [...collectCoverageFrom, '!**/packages/jest/**'],
});

module.exports = (() => {
  if (/babel$/.test(process.argv[1]) && process.env.USE_DEFAULT_BABEL)
    return babel({
      presets: [
        [
          '@babel/env',
          {
            useBuiltIns: 'usage',
            corejs: 3,
          },
        ],
        '@babel/flow',
        '@babel/react',
      ],
      plugins: [
        '@babel/proposal-optional-chaining',
        '@babel/proposal-nullish-coalescing-operator',
        [
          '@babel/transform-runtime',
          {
            corejs: false,
            helpers: false,
            regenerator: true,
            useESModules: false,
          },
        ],
        [
          'module-resolver',
          {
            root: ['./src'],
            cwd: 'packagejson',
          },
        ],
        [
          '@babel/proposal-class-properties',
          {
            loose: true,
          },
        ],
      ],
      ignore:
        process.env.NODE_ENV === 'test'
          ? []
          : ['**/__tests__/**', '**/__mocks__/**'],
    });

  return [
    /* eslint-disable import/no-extraneous-dependencies */
    require('@mikojs/configs'),
    require('@mikojs/configs/lib/withRelay'),
    require('@mikojs/configs/lib/withLerna'),
    /* eslint-enable import/no-extraneous-dependencies */
    {
      // babel
      babel,

      // eslint
      lint,

      // jest
      jest,
    },
  ];
})();
