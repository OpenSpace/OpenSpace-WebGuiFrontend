import React from 'react';
import { MdKeyboardArrowRight } from 'react-icons/md';
import PropTypes from 'prop-types';

import styles from './Arrows.scss';

function RightArrow({ nextSlide }) {
  return (
    <div className={styles.RightArrow} onClick={nextSlide} role="button" tabIndex="0">
      <MdKeyboardArrowRight className={styles.Icon} />
    </div>
  );
}

RightArrow.propTypes = {
  nextSlide: PropTypes.func.isRequired
};

export default RightArrow;
