import React from 'react';

import styles from './TouchFrame.scss';

export default function TouchFrame() {
  return (
    <>
      <div className={`${styles.Frame} ${styles.TopFrame}`} />
      <div className={styles.Corner} />
      <div className={`${styles.Frame} ${styles.RightFrame}`} />
    </>
  );
}
