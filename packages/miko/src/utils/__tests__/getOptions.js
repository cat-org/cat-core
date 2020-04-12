// @flow

import path from 'path';

import getOptions, { type optionsType } from '../getOptions';
import cache from '../cache';

const expectedCommand = [
  ['yarn', 'install'],
  ['lerna', 'exec', 'echo "test"'],
  ['echo', 'test'],
  ['echo', 'test test'],
];

describe('get options', () => {
  beforeAll(() => {
    cache.load({
      filepath: path.resolve('.mikorc.js'),
      config: [
        {
          miko: () => ({
            cmdString: {
              command:
                'yarn install && lerna exec \'echo "test"\' && echo "test" && echo "test test"',
              description: 'cmd string',
            },
            cmdFunc: {
              command: () => [
                ['yarn', 'install'],
                ['lerna', 'exec', 'echo "test"'],
                ['echo', 'test'],
                ['echo', 'test test'],
              ],
              description: 'cmd func',
            },
            mergeCmd: {
              command: 'miko cmdString -a',
              description: 'merge cmd',
            },
            mergeEnv: {
              command: 'NODE_ENV=production miko cmdString',
              description: 'merge env',
            },
          }),
        },
      ],
    });
  });

  test.each`
    argv                           | expected
    ${[]}                          | ${{ type: 'start', configNames: [], keep: false }}
    ${['babel']}                   | ${{ type: 'start', configNames: ['babel'], keep: false }}
    ${['babel', 'lint']}           | ${{ type: 'start', configNames: ['babel', 'lint'], keep: false }}
    ${['--keep']}                  | ${{ type: 'start', configNames: [], keep: true }}
    ${['--keep', 'babel']}         | ${{ type: 'start', configNames: ['babel'], keep: true }}
    ${['--keep', 'babel', 'lint']} | ${{ type: 'start', configNames: ['babel', 'lint'], keep: true }}
    ${['kill']}                    | ${{ type: 'kill' }}
    ${['cmdString']}               | ${{ type: 'command', otherArgs: [], command: expectedCommand }}
    ${['cmdFunc']}                 | ${{ type: 'command', otherArgs: [], command: expectedCommand }}
    ${['cmdFunc', '-a']}           | ${{ type: 'command', otherArgs: ['-a'], command: expectedCommand }}
    ${['mergeCmd']}                | ${{ type: 'command', otherArgs: [], command: [...expectedCommand.slice(0, -1), [...expectedCommand.slice(-1)[0], '-a']] }}
    ${['mergeEnv']}                | ${{ type: 'command', otherArgs: [], command: [['NODE_ENV=production', ...expectedCommand[0]], ...expectedCommand.slice(1)] }}
  `(
    'run $argv',
    async ({
      argv,
      expected,
    }: {|
      argv: $ReadOnlyArray<string>,
      expected: optionsType,
    |}) => {
      const mockLog = jest.fn();

      global.console.error = mockLog;

      const { getCommands, ...options } = await getOptions([
        'node',
        'miko',
        ...argv,
      ]);

      expect({ ...options, command: getCommands?.() }).toEqual(expected);
      (!expected ? expect(mockLog) : expect(mockLog).not).toHaveBeenCalled();
    },
  );
});
