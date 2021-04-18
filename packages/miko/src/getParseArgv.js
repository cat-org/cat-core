import stringArgv from 'string-argv';

import commander from '@mikojs/commander';

import { version } from '../package.json';

const transform = ({ action, ...config }, callback) => ({
  ...config,
  allowUnknownOption: true,
  action: async (...args) => {
    const program = args.find(
      arg => typeof arg !== 'string' && !(arg instanceof Array),
    );

    callback([
      ...stringArgv(
        typeof action === 'string'
          ? action
          : (await action?.(program.opts())) || '',
      ),
      ...program.args,
    ]);
  },
  commands: Object.keys(config.commands || {}).reduce(
    (result, key) => ({
      ...result,
      [key]: transform(config.commands[key], callback),
    }),
    {},
  ),
});

export default config => argv =>
  new Promise(resolve =>
    commander(
      transform(
        {
          ...config,
          name: 'miko',
          version,
          description: 'Use a simple config to manage commands.',
          arguments: '<args...>',
        },
        resolve,
      ),
    ).parse(argv),
  );