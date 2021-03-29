// @flow

import { type commandsType } from '../../getCommands';

export type testingType = [string, commandsType];

export default ([
  ['miko miko', [['command']]],
  ['miko miko miko', [['command'], ['command']]],
  ['miko miko {{ configs.miko }}', [['command', 'miko.config.js']]],
  [
    'miko miko miko {{ configs.miko }}',
    [['command'], ['command', 'miko.config.js']],
  ],
  [
    'miko miko "miko miko" {{ configs.miko }}',
    [['command', '"command"', 'miko.config.js']],
  ],
  [
    'miko miko "miko miko {{ configs.miko }}" {{ configs.miko }}',
    [['command', '"command miko.config.js"', 'miko.config.js']],
  ],
  ['miko miko && miko miko', [['command'], ['command']]],
  [
    'miko miko "miko miko && miko miko" {{ configs.miko }}',
    [['command', '"command && command"', 'miko.config.js']],
  ],
  [
    `miko miko "miko miko 'miko miko && miko miko' {{ configs.miko }}" {{ configs.miko }}`,
    [
      [
        'command',
        `"command 'command && command' miko.config.js"`,
        'miko.config.js',
      ],
    ],
  ],
  ['miko custom', [['custom']]],
]: $ReadOnlyArray<testingType>);