// @flow

import getPort from 'get-port';

import server from '../server';

describe('server', () => {
  test.each`
    dev      | watch
    ${true}  | ${true}
    ${true}  | ${false}
    ${false} | ${true}
    ${false} | ${false}
  `(
    'Running server with dev = $dev, watch = $watch',
    async ({ dev, watch }: {| dev: boolean, watch: boolean |}) => {
      const runningServer = await server({
        src: __dirname,
        dir: __dirname,
        dev,
        watch,
        port: await getPort(),
        restart: jest.fn(),
        close: jest.fn(),
      });

      expect(runningServer).not.toBeNull();

      runningServer.close();
    },
  );
});