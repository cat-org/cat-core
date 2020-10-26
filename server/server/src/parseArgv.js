// @flow

import path from 'path';
import { type Server as ServerType } from 'http';

import ora from 'ora';
import chalk from 'chalk';
import commander from 'commander';

import { createLogger } from '@mikojs/utils';
import tools, {
  type fileDataType,
  type toolsType,
} from '@mikojs/merge-dir/lib/utils/tools';

import server, { type middlewareType } from './index';

/**
 * @param {string} name - command name
 * @param {createLogger} logger - command logger
 *
 * @return {toolsType} - tools.log
 */
export const buildLog = (
  name: string,
  logger: $Call<typeof createLogger, string>,
): $NonMaybeType<$PropertyType<toolsType, 'log'>> => (
  fileData: fileDataType | 'done',
) => {
  if (fileData === 'done') logger.succeed('The server is updated');
  else
    logger
      .info(
        fileData.exists
          ? chalk`File {green (${fileData.filePath})} is changed`
          : chalk`File {red (${fileData.filePath})} is removed`,
      )
      .start('The server is updating');
};

/**
 * @param {string} name - command name
 * @param {Error} err - err message
 *
 * @return {string} - new error message
 */
export const handleErrorMessage = (name: string, err: Error): string =>
  /^Cannot find module.*main.js/.test(err.message)
    ? chalk`Could not find a valid build. Try using {green ${name} build} before running the server`
    : err.message.replace(/\nRequire stack:(.|\n)*/, '');

/**
 * @param {string} name - command name
 * @param {string} version - command version
 * @param {Function} buildMiddleware - build the middleware for the server
 * @param {Array} argv - command line
 *
 * @return {ServerType} - server or null
 */
export default (
  name: string,
  version: string,
  buildMiddleware: (folderPath: string, prefix?: string) => middlewareType<>,
  argv: $ReadOnlyArray<string>,
): Promise<?ServerType> =>
  new Promise((resolve, reject) => {
    const logger = createLogger(
      `@mikojs/${name}`,
      ora({ discardStdin: false }),
    );
    const program = new commander.Command(name).version(
      version,
      '-v, --version',
    );

    ['dev', 'build', 'start'].forEach((command: 'dev' | 'build' | 'start') => {
      program
        .command(`${command} <folder-path>`)
        .option('-p, --port <port>', 'the port of the folder')
        .option('--prefix <prefix>', 'the prefix of the server')
        .action(
          async (
            folderPath: string,
            { port = 3000, prefix }: {| port: number, prefix?: string |},
          ) => {
            server.set(command === 'start' ? 'run' : command);

            try {
              const middleware = buildMiddleware(
                path.resolve(folderPath),
                prefix,
              );

              if (command === 'build') {
                logger.start('Building the server');
                (await server.ready())();
                logger.succeed(
                  chalk`Use {green ${name} start} to run the server`,
                );
                resolve(null);
              } else {
                logger.start('Preparing the server');
                resolve(
                  await server.run(middleware, port, () => {
                    logger.succeed(
                      chalk`Running the server on {underline http://localhost:${port}}`,
                    );
                    tools.set({ log: buildLog(name, logger) });
                  }),
                );
              }
            } catch (e) {
              logger.fail(handleErrorMessage(name, e));
              reject(e);
            }
          },
        );
    });

    program.parse([...argv]);
  });