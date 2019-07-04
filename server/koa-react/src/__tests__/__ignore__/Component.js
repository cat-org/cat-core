// @flow

import React, { type Node as NodeType } from 'react';

import { type ctxType } from '../../types';

type propsType = {|
  path: string,
|};

/** Component */
export default class Component extends React.PureComponent<propsType> {
  /**
   * @example
   * Component.getInitialProps(context)
   *
   * @param {context} context - context data
   *
   * @return {initialProps} - initial props
   */
  static getInitialProps = ({ ctx }: ctxType<>) => ({
    path: ctx.path,
  });

  // TODO component should be ignored
  // eslint-disable-next-line jsdoc/require-jsdoc
  render(): NodeType {
    const { path } = this.props;

    return <div>{path}</div>;
  }
}
