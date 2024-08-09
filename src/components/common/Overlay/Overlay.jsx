import React from 'react';
import PropTypes from 'prop-types';

import styles from './Overlay.scss';

function Overlay({ children = [] }) {
  return (
    <div className={styles.messageOverlay}>
      { children }
    </div>
  );
}

Overlay.propTypes = {
  children: PropTypes.node
};

export default Overlay;
