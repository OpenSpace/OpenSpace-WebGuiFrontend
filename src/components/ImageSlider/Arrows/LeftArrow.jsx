import React from 'react';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import PropTypes from 'prop-types';

import styles from './Arrows.scss';

function LeftArrow({ prevSlide }) {
  return (
    <div className={styles.LeftArrow} onClick={prevSlide} role="button" tabIndex="0">
      <MdKeyboardArrowLeft className={styles.Icon} />
    </div>
  );
}

LeftArrow.propTypes = {
  prevSlide: PropTypes.func.isRequired
};

export default LeftArrow;
