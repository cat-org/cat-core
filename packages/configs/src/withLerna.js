// @flow

import gitBranch from 'git-branch';

import configs from './configs';

const newConfigs = {
  babel: {
    install: (install: $ReadOnlyArray<string>): $ReadOnlyArray<string> => [
      ...install,
      '-W',
    ],
    run: (argv: $ReadOnlyArray<string>): $ReadOnlyArray<string> => [
      ...argv,
      '--config-file',
      '../../babel.config.js',
    ],
  },
  server: {
    run: (argv: $ReadOnlyArray<string>): $ReadOnlyArray<string> => [
      ...argv,
      '--config-file',
      '../../babel.config.js',
    ],
  },
  exec: {
    install: (install: $ReadOnlyArray<string>): $ReadOnlyArray<string> => [
      ...install,
      'lerna',
      'git-branch',
      'flow-mono-cli',
    ],
    run: (argv: $ReadOnlyArray<string>): $ReadOnlyArray<string> =>
      argv.reduce(
        (newArgv: $ReadOnlyArray<string>, argvStr: string) => [
          ...newArgv,
          ...(argvStr === '--changed' && /^lerna:/.test(argv[0])
            ? ['--since', gitBranch.sync().replace(/Branch: /, '')]
            : [argvStr]),
        ],
        [],
      ),
    config: (config: {}): {
      'flow-mono': {
        [string]: $ReadOnlyArray<string>,
      },
      lerna: {
        [string]: $ReadOnlyArray<string>,
      },
    } => ({
      ...config,

      // flow-mono
      'flow-mono': {
        create: ['flow-mono', 'create-symlinks', '.flowconfig'],
        install: ['flow-mono', 'install-types', '--ignoreDeps=peer'],
      },

      // lerna
      lerna: {
        // flow
        flow: [
          'lerna',
          'exec',
          `"flow --quiet${process.env.CI ? ' && flow stop' : ''}"`,
          '--stream',
          '--concurrency',
          '1',
        ],

        // babel
        babel: ['lerna', 'exec', '"configs babel"', '--stream'],
        'babel:watch': ['lerna', 'exec', '"configs babel -w"', '--stream'],
      },
    }),
  },
};

export default Object.keys(configs).reduce(
  (
    result: {
      [string]: {
        install: (install: $ReadOnlyArray<string>) => $ReadOnlyArray<string>,
      },
      ...typeof newConfigs,
    },
    key: $Keys<typeof configs>,
  ) =>
    Object.keys(result).includes(key)
      ? result
      : {
          ...result,
          [key]: {
            install: (install: $ReadOnlyArray<string>) => [...install, '-W'],
          },
        },
  newConfigs,
);
