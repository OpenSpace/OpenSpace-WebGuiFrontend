import React from 'react';
import FocusMenu from './FocusMenu/FocusMenu';
import Markers from './Markers/Markers';
import styles from './TouchBar.scss';
import ExploreClimate from './ExploreClimate';

const TouchBar = props => (
  <div >
    <section className={styles.Grid__Left}>
      <UtilitiesMenu resetStory={props.resetStory}/>
    </section>
    <section className={styles.Grid__Right}>
      <FocusMenu />
    </section>
    <Markers />
  </div>
);

export default TouchBar;
