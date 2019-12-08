// @flow

import commander from 'commander';
import chalk from 'chalk';

import { version } from '../../package.json';

/**
 * @example
 * cliOptions([])
 *
 * @param {Array} argv - command line
 *
 * @return {object} - cli options
 */
export default (
  argv: $ReadOnlyArray<string>,
): Promise<{|
  argv: $ReadOnlyArray<string>,
  filteredArgv: $ReadOnlyArray<string>,
|}> =>
  new Promise(resolve => {
    const program = new commander.Command('nested-flow')
      .version(version, '-v, --version')
      .arguments('[commands...]')
      .usage(chalk`{green [commands...]}`)
      .description(
        chalk`you can use each command in the {cyan flow}

Example:
  nested-flow
  nested-flow {green flow-typed install}`,
      )
      .allowUnknownOption()
      .action(
        (
          _: mixed,
          {
            args: [args],
            rawArgs,
          }: {|
            args: [$ReadOnlyArray<string>],
            rawArgs: $ReadOnlyArray<string>,
          |},
        ) => {
          resolve({
            argv: ['flow', ...rawArgs.slice(2)],
            filteredArgv: ['flow', ...args],
          });
        },
      );

    program
      .command('flow-typed')
      .arguments('[commands...]')
      .usage(chalk`{green [commands...]}`)
      .description(
        chalk`you can use ecah command in the {cyan flow-typed}, and {cyan flow-typed remove} is an additional command used to remove the {cyan flow-typed} folders`,
      )
      .allowUnknownOption()
      .action(
        (
          _: mixed,
          {
            parent: {
              args: [args],
              rawArgs,
            },
          }: {|
            parent: {|
              args: [$ReadOnlyArray<string>],
              rawArgs: $ReadOnlyArray<string>,
            |},
          |},
        ) => {
          resolve({
            argv: rawArgs.slice(2),
            filteredArgv: ['flow-typed', ...args],
          });
        },
      );

    if (argv.length === 2) resolve({ argv: ['flow'], filteredArgv: ['flow'] });
    else {
      const { args, rawArgs } = program.parse([...argv]);

      if (args.length === 0)
        resolve({
          argv: ['flow', ...rawArgs.slice(2)],
          filteredArgv: ['flow', ...args],
        });
    }
  });