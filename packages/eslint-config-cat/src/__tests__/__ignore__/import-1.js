// @flow

// $expectError import/order
import order from '../../index';

import fbjs from 'fbjs';

// $expectError import/no-extraneous-dependencies
import babel from '@babel/core/lib/index';

// $expectError import/no-unresolved
// $expectError import/no-useless-path-segments
import noUnresolver from './../index';

// $expectError import/no-absolute-path
// $expectError import/no-unresolved
import noAbsolutePath from '/etc';

// $expectError import/default
import arrowFunc from './import-2';

// $expectError import/no-named-default
// $expectError import/no-duplicates
import module2, { default as noNamedDefault } from './import-3';

// $expectError import/no-duplicates
import noDuplicates from './import-3';

fbjs();

// $expectError import/no-self-import
// $expectError import/first
// $expectError import/newline-after-import
import * as namespace from './import-1';
fbjs();

// $expectError import/exports-last
// $expectError import/group-exports
export const exportFirst = 'test';

fbjs();

// $expectError import/no-named-as-default-member
module2.test();

// $expectError import/namespace
namespace.test();

// $expectError import/group-exports
// $expectError import/no-mutable-exports
export let exportSecond: string = 'test';
