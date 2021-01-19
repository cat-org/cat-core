// @flow

import fs from 'fs';
import path from 'path';

import { getPackagesSync } from '@lerna/project';
import findCacheDir from 'find-cache-dir';
import mkdirp from 'mkdirp';
import copyDir from 'copy-dir';

import { type packageType } from './types';
import rimrafSync from './rimrafSync';

export const cacheDir: $Call<typeof findCacheDir, string> = findCacheDir({
  name: '@mikojs/flow-typed',
  thunk: true,
});

/**
 * @param {boolean} restore - restore flow-typed in the cache directory or not
 */
export default async (restore: boolean) => {
  if (restore && !fs.existsSync(cacheDir())) return;

  await Promise.all(
    getPackagesSync().map(async ({ name, location }: packageType) => {
      const folders = [
        path.resolve(location, './flow-typed/npm'),
        cacheDir(name),
      ];

      if (restore) folders.reverse();

      const [sourceFolder, targetFolder] = folders;

      if (!fs.existsSync(sourceFolder)) return;

      if (fs.existsSync(targetFolder)) await rimrafSync(targetFolder);

      mkdirp.sync(targetFolder);
      copyDir.sync(sourceFolder, targetFolder);
    }),
  );
};
