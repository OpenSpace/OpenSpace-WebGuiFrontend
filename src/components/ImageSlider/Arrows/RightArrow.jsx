import React from 'react';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

import styles from './Arrows.scss';

function RightArrow({ nextSlide }) {
  return (
    <div className={styles.RightArrow} onClick={nextSlide} role="button" tabIndex="0">
      <Icon icon="material-symbols:keyboard-arrow-right" className={styles.Icon} />
    </div>
  );
}

RightArrow.propTypes = {
  nextSlide: PropTypes.func.isRequired
};

export default RightArrow;
