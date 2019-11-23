// @flow

import { emptyFunction } from 'fbjs';

import getConfig from '../getConfig';
import Cache from '../Cache';

jest.mock(
  '../Cache',
  () =>
    class MockCache {
      routesData = [];
      cacheDir = () => {};
    },
);

describe('get config', () => {
  test('routes data is smaller then 2', () => {
    expect(
      getConfig(
        false,
        '/',
        undefined,
        undefined,
        new Cache('/folderPath', emptyFunction.thatReturnsArgument),
      ).optimization.splitChunks.cacheGroups.commons.minChunks,
    ).toBe(2);
  });
});
