// @flow

import memoizeOne from 'memoize-one';

import styles from './styles';
import jest from './jest';
import configs from './configs';
import Store from './index';

import template from 'templates/pages';

/** react store */
class React extends Store {
  +subStores = [styles, jest, configs];

  storeUseReact = false;

  /**
   * @example
   * react.checkReact()
   */
  +checkReact = memoizeOne(
    async (
      useServer: $PropertyType<$PropertyType<Store, 'ctx'>, 'useServer'>,
    ) => {
      if (useServer)
        this.storeUseReact = (await this.prompt({
          name: 'useReact',
          message: 'use react or not',
          type: 'confirm',
          default: false,
        })).useReact;
      else this.storeUseReact = false;

      this.debug(this.storeUseReact);
    },
  );

  /**
   * @example
   * react.start(ctx)
   *
   * @param {Object} ctx - store context
   */
  +start = async (ctx: $PropertyType<Store, 'ctx'>) => {
    const { useServer } = ctx;

    await this.checkReact(useServer);

    ctx.useReact = this.storeUseReact;
  };

  /**
   * @example
   * react.end(ctx)
   *
   * @param {Object} ctx - store context
   */
  +end = async ({ lerna }: $PropertyType<Store, 'ctx'>) => {
    if (!this.storeUseReact) return;

    await this.writeFiles({
      'src/pages/index.js': template,
    });

    if (lerna) return;

    await this.execa(
      'yarn add react react-dom @cat-org/koa-react',
      'yarn add --dev @babel/preset-react',
    );
  };
}

export default new React();
