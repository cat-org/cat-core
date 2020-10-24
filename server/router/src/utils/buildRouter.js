// @flow

import url from 'url';
import {
  type IncomingMessage as IncomingMessageType,
  type ServerResponse as ServerResponseType,
} from 'http';

import {
  parse,
  type QueryParameters as QueryParametersType,
} from 'query-string';

import { requireModule } from '@mikojs/utils';
import { type middlewareType } from '@mikojs/server';

import { type cacheType } from './buildRouterCache';

type reqType = IncomingMessageType & {|
  query: QueryParametersType,
|};

/**
 * @param {cacheType} cache - router cache
 *
 * @return {middlewareType} - router middleware
 */
export default (
  cache: cacheType,
): middlewareType<reqType, ServerResponseType> => (
  req: reqType,
  res: ServerResponseType,
) => {
  const { pathname, query } = url.parse(req.url);
  const router = cache.find(({ regExp }: $ElementType<cacheType, number>) =>
    regExp.exec(pathname || ''),
  );

  if (!router) {
    res.statusCode = 404;
    res.end();
    return;
  }

  const { filePath, getUrlQuery } = router;

  req.query = {
    ...parse(query || ''),
    ...getUrlQuery(pathname),
  };
  requireModule(filePath)(req, res);
};
