// @flow

import { URL } from 'url';

import { type ComponentType } from 'react';

import { requireModule } from '@mikojs/utils';
import {
  type documentComponentType,
  type mainComponentType,
  type errorComponentPropsType,
} from '@mikojs/react-ssr';
import server from '@mikojs/react-ssr/lib/server';

import { type routesType } from './buildRoutes';

/**
 * @param {routesType} routes - routes cache
 *
 * @return {Function} - middleware function
 */
export default (routes: routesType) => async (
  req: http.IncomingMessage,
  res: http.ServerResponse,
) => {
  const { href, pathname, search, hash } = new URL(
    req.url,
    `http://${req.headers.host}`,
  );

  (
    await server(
      href,
      { req, res, pathname, search, hash },
      {
        Document: requireModule<documentComponentType<*, *>>(routes.document),
        Main: requireModule<mainComponentType<*, *>>(routes.main),
        Error: requireModule<ComponentType<errorComponentPropsType>>(
          routes.error,
        ),
        routes: routes.get(),
      },
    )
  ).pipe(res);
};
