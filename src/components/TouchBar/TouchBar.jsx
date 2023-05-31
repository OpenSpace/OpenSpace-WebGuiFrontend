import React from 'react';
import PropTypes from 'prop-types';

import FocusMenu from './FocusMenu/FocusMenu';
import Markers from './Markers/Markers';
import UtilitiesMenu from './UtilitiesMenu/UtilitiesMenu';

import styles from './TouchBar.scss';

function TouchBar({ resetStory }) {
  return (
    <div className={styles.TouchBar}>
      <section className={styles.Grid__Left}>
        <UtilitiesMenu resetStory={resetStory} />
      </section>
      <section className={styles.Grid__Right}>
        <FocusMenu />
      </section>
      <Markers />
    </div>
  );
}

TouchBar.propTypes = {
  resetStory: PropTypes.func.isRequired
};

export default TouchBar;
