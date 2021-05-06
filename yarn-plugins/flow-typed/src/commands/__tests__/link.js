import { generateCli } from '@mikojs/yarn-plugin-utils/src/testing';

import Link from '../Link';
import symlinkSync from '../../utils/symlinkSync';

const cli = generateCli(Link);
const args = ['flow-typed', 'link'];

jest.mock('../../utils/symlinkSync', () => jest.fn());

describe('flow-typed link', () => {
  beforeEach(() => {
    symlinkSync.mockClear();
  });

  test('skip root workspace', async () => {
    await cli.run(args);

    expect(symlinkSync).not.toHaveBeenCalled();
  });

  test('link files in workspace', async () => {
    await cli.run(args, {
      cwd: __dirname,
    });

    expect(symlinkSync).toHaveBeenCalled();
  });
});