// @flow

import React, { type Node as NodeType } from 'react';

type propsType = {|
  value: string,
  test: string,
|};

/** Home Component */
export default class Home extends React.PureComponent<propsType> {
  /**
   * @example
   * Home.getInitialProps()
   *
   * @return {initialProps} - initial props
   */
  static getInitialProps = () => ({
    test: 'value',
  });

  // TODO component should be ignored
  // eslint-disable-next-line jsdoc/require-jsdoc
  render(): NodeType {
    const { value, test } = this.props;

    return (
      <div>
        {value}-{test}
      </div>
    );
  }
}
