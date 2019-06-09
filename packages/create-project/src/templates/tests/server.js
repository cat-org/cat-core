// @flow

export default (useReact?: boolean, useGraphql?: boolean) => `/**
 * @jest-environment node
 *
 * @flow
 */

import path from 'path';

import fetch, { type Response as ResponseType } from 'node-fetch';

import server from '@cat-org/server/lib/bin';${
  !useGraphql
    ? ''
    : `

import { version } from '../../package.json';`
}

let runningServer: http$Server;

describe('server', () => {
  beforeAll(async () => {
    runningServer = await server({
      src: path.resolve(__dirname, '..'),
      dir: path.resolve(__dirname, '..'),
    });
  });${
    !useReact
      ? ''
      : `

  describe('pages', () => {
    test('/', async () => {
      expect(
        await fetch('http://localhost:8000').then((res: ResponseType) =>
          res.text(),
        ),
      ).toBeDefined();
    });
  });`
  }${
  !useGraphql
    ? ''
    : `

  describe('graphql', () => {
    test('version', async () => {
      expect(
        await fetch('http://localhost:8000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            query: \`
  {
    version
  }
\`,
          }),
        }).then((res: ResponseType) => res.json()),
      ).toEqual({
        data: {
          version,
        },
      });
    });
  });`
}

  afterAll(() => {
    runningServer.close();
  });
});`;
