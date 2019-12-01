// @flow

import path from 'path';

import Koa from 'koa';
import getPort from 'get-port';
import { type configType } from 'koa-webpack';

import React from '../../index';

/**
 * @example
 * server(true, true)
 *
 * @param {boolean} dev - is dev or not
 * @param {boolean} useStatic - is static or not
 *
 * @return {{ domain: string, server: object }} - domain and http server
 */
export default async (
  dev: boolean,
  useStatic: boolean,
): Promise<{|
  domain: string,
  server: http$Server,
|}> => {
  const app = new Koa();
  const port = parseInt(process.env.NODE_PORT || (await getPort()), 10);
  const folderPath = path.resolve(
    __dirname,
    '../../../node_modules/test-static',
  );

  /**
   * @example
   * configFunc()
   *
   * @param {configType} config - prev koa react config
   *
   * @return {configType} - koa react config
   */
  const configFunc = ({ config, ...otherConfigs }: configType): configType => {
    if (!dev || useStatic)
      config.output = {
        ...config.output,
        path: path.resolve(folderPath, './public/js'),
      };

    return {
      ...otherConfigs,
      config,
    };
  };

  const customReact = new React(path.resolve(__dirname, './custom'), {
    dev,
    config: configFunc,
    basename: '/custom',
  });
  const pagesReact = new React(path.resolve(__dirname, './pages'), {
    dev,
    config: configFunc,
  });

  if (!dev) {
    await customReact.buildJs();
    await pagesReact.buildJs();
  }

  app.use(await customReact.middleware());
  app.use(await pagesReact.middleware());

  return {
    domain: `http://localhost:${port}`,
    server: await new Promise(resolve => {
      const server = app.listen(port, async () => {
        const { log } = console;

        if (!dev && useStatic) {
          await customReact.buildStatic({
            baseUrl: `http://localhost:${port}`,
            folderPath,
          });
          await pagesReact.buildStatic({
            baseUrl: `http://localhost:${port}`,
            folderPath,
            urlParamsRedirect: (route: string) =>
              route
                .replace(/:foo/, 'aaaa')
                .replace(/:bar/, 'bbbb')
                .replace(/\(.*\)/, ''),
          });
        }

        if (process.env.NODE_ENV !== 'test') log(`Run server at port: ${port}`);

        resolve(server);
      });
    }),
  };
};
