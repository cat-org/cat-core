// @flow

import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import debug from 'debug';
import outputFileSync from 'output-file-sync';

import { createLogger } from '@mikojs/utils';

import cache from './cache';

const logger = createLogger('@mikojs/miko');
const debugLog = debug('miko:generateFiles');

/**
 * @example
 * generateFiles([])
 *
 * @param {Array} configNames - config names
 *
 * @return {Array} - generating files
 */
export default (
  configNames: $ReadOnlyArray<string>,
): $ReadOnlyArray<string> => {
  const gitignore = [cache.resolve, path.resolve]
    .reduce((result: string, getPath: (filePath: string) => string): string => {
      const filePath = getPath('./.gitignore');

      return !result && fs.existsSync(filePath)
        ? fs.readFileSync(filePath, 'utf-8')
        : result;
    }, '')
    .replace(/^#.*$/gm, '');

  return cache
    .keys()
    .filter((key: string) =>
      key === 'miko'
        ? false
        : configNames.length === 0 || configNames.includes(key),
    )
    .reduce(
      (result: $ReadOnlyArray<string>, key: string): $ReadOnlyArray<string> => {
        const { configFile, ignoreFile } = cache.get(key);

        debugLog({ key, configFile, ignoreFile });

        return [configFile, ignoreFile]
          .filter(Boolean)
          .reduce(
            (
              subResult: $ReadOnlyArray<string>,
              argu: [string, string],
            ): $ReadOnlyArray<string> => {
              const filename = path.basename(argu[0]);

              if (!new RegExp(filename).test(gitignore))
                logger.warn(
                  chalk`{red ${filename}} should be added in {bold {gray .gitignore}}`,
                );

              debugLog(argu);
              outputFileSync(...argu);

              return [...subResult, argu[0]];
            },
            result,
          );
      },
      [],
    );
};
