/**
 * fixme-flow-file-annotation
 *
 * TODO: Flow not support @babel/plugin-proposal-pipeline-operator
 * https://github.com/facebook/flow/issues/5443
 */
/* eslint-disable flowtype/no-types-missing-file-annotation, flowtype/require-valid-file-annotation */

import path from 'path';

import { emptyFunction } from 'fbjs';

import server, { type contextType } from '@mikojs/server';
import base from '@mikojs/koa-base';
import Graphql from '@mikojs/koa-graphql';

/**
 * @example
 * server(context)
 *
 * @param {contextType} context - the context of the server
 *
 * @return {object} - http server
 */
export default async ({
  dir,
  dev,
  watch,
  port,
}: contextType): Promise<http$Server> => {
  const graphql = new Graphql(path.resolve(dir, './graphql'));

  return (
    server.init()
    |> server.use(base)
    |> (undefined
      |> server.start
      |> ('/graphql'
        |> server.all
        |> server.use(
          graphql.middleware({
            graphiql: dev,
            pretty: dev,
          }),
        )
        |> server.end)
      |> server.end)
    |> server.run(port)
    |> (dev && watch
      ? server.watch(dir, [graphql.update])
      : emptyFunction.thatReturnsArgument)
  );
};