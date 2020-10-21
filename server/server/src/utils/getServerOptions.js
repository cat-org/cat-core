// @flow

import commander from 'commander';
import chalk from 'chalk';

import { type eventType } from '../index';
import { version } from '../../package.json';

export type serverOptionsType = {|
  event: eventType | 'error',
  filePath: string,
  port: number,
|};

/**
 * @param {Array} argv - command line
 *
 * @return {serverOptionsType} - server options
 */
export default (argv: $ReadOnlyArray<string>): Promise<serverOptionsType> =>
  new Promise(resolve => {
    const program = new commander.Command('server')
      .version(version, '-v, --version')
      .arguments('<event>')
      .description(
        chalk`Example:
  server {green dev}
  server {green build}
  server {green start}`,
      )
      .option('-f, --file-path <filePath>', 'the path of the folder')
      .option('-p, --port <port>', 'the port of the folder')
      .action(
        (
          event: eventType,
          {
            filePath = './middleware.js',
            port = 3000,
          }: {| filePath: string, port: number |},
        ) => {
          resolve({
            event,
            filePath,
            port,
          });
        },
      );

    if (argv.length !== 2) program.parse([...argv]);
    else resolve({ event: 'error', filePath: './middleware.js', port: 3000 });
  });