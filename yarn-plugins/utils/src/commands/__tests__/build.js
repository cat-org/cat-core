import fs from 'fs';
import path from 'path';

import Build from '../Build';
import { generateCli } from '../../testing';

jest.mock('fs');

test('plugin build', async () => {
  const builderFilePath = path.resolve('./node_modules/.bin/builder');
  const cli = generateCli(Build, [
    ['node', builderFilePath, 'build', 'plugin'],
  ]);

  fs.existsSync.mockImplementation(filePath => filePath === builderFilePath);
  await cli.run(['plugin', 'build']);

  expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
  expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
});