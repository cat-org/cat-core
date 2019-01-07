// @flow

import path from 'path';

import memoizeOne from 'memoize-one';
import inquirer from 'inquirer';
import { isURL } from 'validator';
import debug from 'debug';
import { emptyFunction } from 'fbjs';

import { mockChoice } from '@cat-org/utils';

import license from './license';
import readme from './readme';
import Store, { type ctxType, type pkgType } from './index';

import getEngines from 'utils/getEngines';
import getUser from 'utils/getUser';
import normalizedQuestions from 'utils/normalizedQuestions';

const debugLog = debug('create-project:store:pkg');

export const PKG_QUESTIONS = [
  {
    name: 'private',
    message: 'is private or not',
    type: 'confirm',
    default: false,
  },
  {
    name: 'description',
  },
  {
    name: 'homepage',
    validate: (val: string) =>
      isURL(val, { require_protocol: true }) ||
      'must be url, for example: https://cat.org',
  },
  {
    name: 'repository',
    validate: (val: string) =>
      isURL(val, { require_protocol: true }) ||
      /^git@.*:.*\.git$/.test(val) ||
      'must be url or git ssh, for example: https://github.com/cat-org/core.git',
  },
  {
    name: 'keywords',
    message: 'keywords (comma to split)',
    filter: (val: string): $ReadOnlyArray<string> =>
      val.split(/\s*,\s*/g).filter((d: string) => d !== ''),
    validate: (val: $ReadOnlyArray<string>) =>
      val.length !== 0 || 'can not be empty',
  },
];

/** store pkg */
class Pkg extends Store {
  subStores = [license, readme];

  storePkg: pkgType = {
    license: 'MIT',
    version: '1.0.0',
    main: './lib/index.js',
    husky: {
      hooks: {
        'pre-commit': 'configs lint-staged && yarn flow',
      },
    },
    scripts: {},
  };

  /**
   * @example
   * pkg.defaultInfo('/path')
   *
   * @param {string} projectDir - project dir
   */
  defaultInfo = memoizeOne(async (projectDir: string): Promise<void> => {
    const [username, email] = await getUser();
    const questionResult = await inquirer.prompt(
      normalizedQuestions<$ReadOnlyArray<string>>(...PKG_QUESTIONS),
    );

    this.storePkg.name = path.basename(projectDir);
    this.storePkg.engines = await getEngines();
    this.storePkg.author = `${username} <${email}>`;

    Object.keys(questionResult).forEach((key: string) => {
      if (key === 'private') {
        mockChoice(
          questionResult[key],
          () => {
            this.storePkg.private = true;
          },
          emptyFunction,
        );
        return;
      }

      this.storePkg[key] = questionResult[key];
    });

    debugLog(this.storePkg);
  }, emptyFunction.thatReturnsTrue);

  addScripts = memoizeOne(() => {
    this.storePkg.scripts = {
      dev: 'configs babel -w',
      prod: 'NODE_ENV=production configs babel',
      test: 'configs test',
    };
  }, emptyFunction.thatReturnsTrue);

  /**
   * @example
   * pkg.start(ctx)
   *
   * @param {Object} ctx - store context
   */
  start = async (ctx: ctxType): Promise<void> => {
    const { projectDir } = ctx;

    await this.defaultInfo(projectDir);
    this.addScripts();

    ctx.pkg = this.storePkg;
  };

  /**
   * @example
   * pkg.end(ctx)
   */
  end = () => {
    this.writeFiles({
      'package.json': JSON.stringify(this.storePkg, null, 2),
    });
  };
}

export default new Pkg();
