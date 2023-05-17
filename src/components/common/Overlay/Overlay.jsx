// @flow
import React, { Element } from 'react';

import styles from './Overlay.scss';

function Overlay(props: { children: Element<any> }): Element<any> {
  return (
    <div className={styles.messageOverlay}>
      { props.children }
    </div>
  );
}

export default Overlay;
