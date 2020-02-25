// @flow

import crypto from 'crypto';

import findCacheDir from 'find-cache-dir';
import outputFileSync from 'output-file-sync';
import debug from 'debug';
import { emptyFunction } from 'fbjs';

import { type optionsType } from '../index';

import { type cacheType } from './buildCache';

const cacheDir = findCacheDir({
  name: crypto
    .createHmac('sha256', `@mikojs/koa-react ${new Date().toString()}`)
    .digest('hex')
    .slice(0, 8),
  thunk: true,
});
const debugLog = debug('react:writeClient');

/**
 * @example
 * writeClient(options, cache)
 *
 * @param {optionsType} options - koa react options
 * @param {cacheType} cache - koa react cache
 *
 * @return {string} - client path
 */
export default (
  { handler = emptyFunction.thatReturnsArgument }: optionsType,
  cache: cacheType,
): string => {
  const clientPath = cacheDir('client.js');

  debugLog(clientPath);
  outputFileSync(
    clientPath,
    `const { setConfig } =  require('react-hot-loader');

const handleUnhandledRejection = require('@mikojs/utils/lib/handleUnhandledRejection');
const client = require('@mikojs/react-ssr/lib/client');

handleUnhandledRejection();
setConfig({
  errorReporter: Error,
});
client({
  Main: require('${cache.main}').default || require('${cache.main}'),
  Loading: require('${cache.loading}').default || require('${cache.loading}'),
  Error: require('${cache.error}').default || require('${cache.error}'),
  routesData: [${handler(cache.routesData)
    .map(
      ({
        path,
        component: { chunkName },
        filePath,
      }: $ElementType<$PropertyType<cacheType, 'routesData'>, number>) =>
        `{ ${[
          'exact: true',
          `path: ${JSON.stringify(path)}`,
          `component: { ${[
            `chunkName: '${chunkName}'`,
            `loader: () => import(/* webpackChunkName: "${chunkName}" */ '${filePath}')`,
          ].join(',')} }`,
        ].join(',')} }`,
    )
    .join(',')}],
});`,
  );

  return clientPath;
};
