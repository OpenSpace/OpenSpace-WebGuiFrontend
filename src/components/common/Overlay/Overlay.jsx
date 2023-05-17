import React from 'react';

import styles from './Overlay.scss';

function Overlay({ children }) {
  return (
    <div className={styles.messageOverlay}>
      { children }
    </div>
  );
}

export default Overlay;
