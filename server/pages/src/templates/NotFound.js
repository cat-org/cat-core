// @flow

import React, { type Node as NodeType } from 'react';
import { Helmet } from 'react-helmet';

import { type pageInitialArguType } from '@mikojs/react-ssr';

import * as styles from './styles/notFound';

type propsType = {||};

/** @react render the not found page */
const NotFound = () => (
  <div style={styles.root}>
    <h1 style={styles.h1}>404</h1>

    <h2 style={styles.h2}>Page not found</h2>
  </div>
);

/**
 * @param {pageInitialArguType} context - cnotext data
 *
 * @return {object} - initial props
 */
NotFound.getInitialProps = ({
  ctx,
}: pageInitialArguType<{ status: number }>): {|
  head: NodeType,
|} => {
  ctx.status = 404;

  return {
    head: (
      <Helmet>
        <title>404 | Page not found</title>
      </Helmet>
    ),
  };
};

export default React.memo<propsType>(NotFound);