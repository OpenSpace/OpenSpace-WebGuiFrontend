import React from 'react';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

import styles from './Arrows.scss';

function LeftArrow({ prevSlide }) {
  return (
    <div className={styles.LeftArrow} onClick={prevSlide} role="button" tabIndex="0">
      <Icon icon="material-symbols:keyboard-arrow-left" className={styles.Icon} />
    </div>
  );
}

LeftArrow.propTypes = {
  prevSlide: PropTypes.func.isRequired
};

export default LeftArrow;
