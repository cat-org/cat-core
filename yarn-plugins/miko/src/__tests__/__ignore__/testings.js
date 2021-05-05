const config = {
  miko: {
    command: 'test-miko',
  },
};

const args = ['miko-todo', 'miko'];

const expected = ['test-miko'];

export default [
  ['does not have any config', null, args, null],
  ['run a custom command', config, args, [expected]],
  [
    'run a custom command with other args',
    config,
    [...args, '-a'],
    [[...expected, '-a']],
  ],
  [
    'support to run multiple commands',
    {
      miko: {
        command: 'test-miko && test-miko',
      },
    },
    args,
    [expected, expected],
  ],
  [
    'support function command',
    {
      miko: {
        command: () => 'test-miko',
      },
    },
    args,
    [expected],
  ],
];
