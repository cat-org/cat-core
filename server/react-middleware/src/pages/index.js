// @flow

import path from 'path';

import Router from 'koa-router';

import { d3DirTree } from '@cat-org/utils';
import { type d3DirTreeNodeType } from '@cat-org/utils/lib/d3DirTree';

import Document from './Document';
import Container from './Container';
import renderPage from './renderPage';

import { type entryType } from 'utils/getConfig';

export type redirectType = (
  urlPattern: $ReadOnlyArray<string>,
) => $ReadOnlyArray<string>;

/** get pages */
class Pages {
  /**
   * @example
   * pages.get('folder path', value => value)
   *
   * @param {string} folderPath - folder path
   * @param {Function} redirect - redirect function
   *
   * @return {Object} - router and entry
   */
  get = (
    folderPath: string,
    redirect: redirectType,
  ): {
    router: Router,
    entry: entryType,
  } => {
    const router = new Router();
    const entry: entryType = {};

    d3DirTree(folderPath, {
      extensions: /.jsx?$/,
    })
      .leaves()
      .forEach(({ data: { path: filePath } }: d3DirTreeNodeType) => {
        const relativePath = path
          .relative(folderPath, filePath)
          .replace(/\.jsx?$/, '');

        entry[relativePath.replace(/\//g, '-')] = [filePath];

        redirect([
          relativePath.replace(/(index)?$/, '').replace(/^/, '/'),
        ]).forEach((routerPath: string) => {
          router.get(
            routerPath,
            async (ctx: koaContextType, next: () => Promise<void>) => {
              ctx.type = 'text/html; charset=utf-8';
              ctx.body = await renderPage(
                ctx,
                Document,
                Container,
                require(filePath),
              );

              await next();
            },
          );
        });
      });

    return {
      router,
      entry,
    };
  };
}

export default new Pages();
