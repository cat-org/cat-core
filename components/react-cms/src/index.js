// @flow

import React from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import Frame from 'react-frame-component';

import Previewer from './Previewer';
import useDnd from './hooks/useDnd';
import * as styles from './styles';

/* eslint-disable */
const Example = ({ id }) => <div {...useDnd(id)}>test</div>;
/* eslint-enable */

/** @react use to control the all main components */
const Cms = () => (
  <DndProvider backend={HTML5Backend}>
    <div style={styles.root}>
      <div>
        <Example id="1" />
        <Example id="2" />
      </div>

      <Frame
        style={styles.iframe}
        head={
          <link
            rel="stylesheet"
            href="https://necolas.github.io/normalize.css/8.0.1/normalize.css"
          />
        }
      >
        <Previewer />
      </Frame>
    </div>
  </DndProvider>
);

export default React.memo<{||}>(Cms);
