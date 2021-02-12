// @flow

// $expectError import/order
import order from '../testings';

import fbjs from 'fbjs';

// $expectError import/no-extraneous-dependencies
import babel from '@babel/core/lib';

// $expectError import/no-unresolved, import/no-useless-path-segments
import noUnresolver from './../test';

// $expectError import/no-absolute-path, import/no-unresolved
import noAbsolutePath from '/etc';

// $expectError import/default, import/no-duplicates
import arrowFunc from './import2';

// $expectError import/default, import/no-duplicates
import noDuplicates from './import2';

// $expectError import/no-named-default
import func, { default as noNamedDefault } from './func';

fbjs();

// $expectError import/first, import/newline-after-import, import/no-self-import
import * as namespace from './import1';
fbjs();

fbjs();

// $expectError import/no-named-as-default-member
func.correct();

// $expectError import/namespace
namespace.test();

// $expectError import/no-mutable-exports
export let exportLet: string = 'test';
exportLet += 1;

export default 'export default';