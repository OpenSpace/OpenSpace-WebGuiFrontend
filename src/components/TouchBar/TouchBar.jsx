import React from 'react';

import FocusMenu from './FocusMenu/FocusMenu';
import Markers from './Markers/Markers';
import UtilitiesMenu from './UtilitiesMenu/UtilitiesMenu';

import styles from './TouchBar.scss';

function TouchBar(props) {
  return (
    <div className={styles.TouchBar}>
      <section className={styles.Grid__Left}>
        <UtilitiesMenu resetStory={props.resetStory} />
      </section>
      <section className={styles.Grid__Right}>
        <FocusMenu />
      </section>
      <Markers />
    </div>
  );
}

export default TouchBar;
