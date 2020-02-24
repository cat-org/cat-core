// @flow

import debug from 'debug';
import {
  type Context as koaContextType,
  type Middleware as koaMiddlewareType,
} from 'koa';
import React from 'react';

import { requireModule } from '@mikojs/utils';
import server from '@mikojs/react-ssr/lib/server';

import { type optionsType } from '../index';

import { type cacheType } from './buildCache';

const debugLog = debug('react:buildServer');

type ctxType = {
  ...koaContextType,
  assetsByChunkName: { [string]: string },
};

/**
 * @example
 * buildServer(options, cache, urls)
 *
 * @param {optionsType} options - koa react options
 * @param {cacheType} cache - cache data
 *
 * @return {koaMiddlewareType} - koa middleware
 */
export default ({ basename }: optionsType, cache: cacheType) => async (
  ctx: ctxType,
  next: () => Promise<void>,
) => {
  debugLog(ctx.path);

  const commonsUrl =
    ctx.assetsByChunkName[
      [basename?.replace(/^\//, ''), 'commons'].filter(Boolean).join('/')
    ];
  const clientUrl =
    ctx.assetsByChunkName[
      [basename?.replace(/^\//, ''), 'client'].filter(Boolean).join('/')
    ];

  if (commonsUrl === ctx.path) {
    ctx.status = 200;
    ctx.type = 'application/javascript';
    ctx.body = '';
    return;
  }

  if (ctx.accepts('html') !== 'html') {
    await next();
    return;
  }

  ctx.status = 200;
  ctx.type = 'text/html';
  ctx.respond = false;

  (
    await server(
      ctx,
      {
        Document: requireModule(cache.document),
        Main: requireModule(cache.main),
        Error: requireModule(cache.error),
        routesData: cache.routesData.map(
          ({
            filePath,
            ...routeData
          }: $ElementType<$PropertyType<cacheType, 'routesData'>, number>) =>
            routeData,
        ),
      },
      [
        <script key="common" src={commonsUrl} async />,
        <script key="client" src={clientUrl} async />,
      ],
      (errorHtml: string) => {
        ctx.res.end(errorHtml);
      },
    )
  ).pipe(ctx.res);
};
