import React from 'react';
import styles from './Climate.scss';
import InfoButton from './buttons/InfoButton';

const Climate = props => (
  <div className={styles.Climate}>
    <section className={styles.Grid__Left}>
      <UtilitiesMenu resetStory={props.resetStory}/>
    </section>
    <section className={styles.Grid__Right}>
      <FocusMenu />
    </section>
    <Markers />
  </div>
);

export default Climate;
