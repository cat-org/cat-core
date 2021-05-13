import path from 'path';

import { execUtils } from '@yarnpkg/core';

export default {
  hooks: {
    afterAllInstalled: async ({ cwd, workspaces }) => {
      await execUtils.pipevp('yarn', [
        'prettier',
        '--loglevel',
        'silent',
        '--write',
        '--parser',
        'json',
        ...workspaces.map(({ cwd }) => path.resolve(cwd, './package.json')),
      ], { cwd, stdout: process.stdout, stderr: process.stderr });
    },
  },
};