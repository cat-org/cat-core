// @flow

import path from 'path';

import debug from 'debug';

import { d3DirTree, requireModule } from '@cat-org/utils';
import { type d3DirTreeNodeType } from '@cat-org/utils/lib/d3DirTree';

import { type propsType as rootPropsType } from './Root';

import NotFound from 'templates/NotFound';

export type redirectType = (
  urlPattern: $ReadOnlyArray<string>,
) => $ReadOnlyArray<string>;

const debugLog = debug('react:Cache');

/** Cache to store the parse data */
export default class Cache {
  routesData: $PropertyType<rootPropsType, 'routesData'>;
  document: string;
  main: string;
  loading: string;
  error: string;

  /**
   * @example
   * new cache('/folder-path', () => {})
   *
   * @param {string} folderPath - folder path
   * @param {Function} redirect - redirect url path
   * @param {string} basename - basename to join url
   * @param {RegExp} exclude - exclude file path
   */
  constructor(
    folderPath: string,
    redirect: redirectType,
    basename?: string,
    exclude?: RegExp,
  ) {
    const notFound = {
      exact: true,
      path: [`${basename || ''}/*`],
      component: {
        filePath: path.resolve(__dirname, '../templates/NotFound.js'),
        chunkName: `pages${basename || ''}/notFound`,
        loader: async () => ({
          default: NotFound,
        }),
      },
    };

    this.routesData = [notFound];
    this.document = path.resolve(__dirname, '../templates/Document.js');
    this.main = path.resolve(__dirname, '../templates/Main.js');
    this.loading = path.resolve(__dirname, '../templates/Loading.js');
    this.error = path.resolve(__dirname, '../templates/Error.js');

    d3DirTree(folderPath, {
      extensions: /.jsx?$/,
      exclude,
    })
      .leaves()
      .forEach(({ data: { name, path: filePath } }: d3DirTreeNodeType) => {
        const relativePath = path
          .relative(folderPath, filePath)
          .replace(/\.jsx?$/, '');

        debugLog(relativePath);

        if (/^\.templates/.test(relativePath))
          switch (relativePath.replace(/^\.templates\//, '')) {
            case 'Document':
              this.document = filePath;
              return;

            case 'Main':
              this.main = filePath;
              return;

            case 'Loading':
              this.loading = filePath;
              return;

            case 'Error':
              this.error = filePath;
              return;

            case 'NotFound':
              this.routesData = [
                ...this.routesData.filter(
                  ({
                    component: { chunkName },
                  }: $ElementType<
                    $PropertyType<rootPropsType, 'routesData'>,
                    number,
                  >) => chunkName !== notFound.component.chunkName,
                ),
                {
                  ...notFound,
                  component: {
                    ...notFound.component,
                    filePath,
                    loader: async () => ({
                      default: requireModule(filePath),
                    }),
                  },
                },
              ];
              return;

            default:
              return;
          }

        const routePath = redirect([
          relativePath.replace(/(\/?index)?$/, '').replace(/^/, '/'),
        ]);

        debugLog(routePath);

        this.routesData = [
          {
            exact: true,
            path: !basename
              ? routePath
              : routePath.map((prevPath: string) => `${basename}${prevPath}`),
            component: {
              filePath,
              chunkName: `pages${basename || ''}/${relativePath}`,
              loader: async () => ({
                default: requireModule(filePath),
              }),
            },
          },
          ...this.routesData,
        ];
        return;
      });

    debugLog(this.routesData);
    debugLog(this.document);
    debugLog(this.main);
    debugLog(this.loading);
    debugLog(this.error);
  }
}
