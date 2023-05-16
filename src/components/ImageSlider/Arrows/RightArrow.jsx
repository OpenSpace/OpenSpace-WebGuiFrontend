import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../../common/MaterialIcon/MaterialIcon';
import styles from './Arrows.scss';

function RightArrow({ nextSlide }) {
  return (
    <div className={styles.RightArrow} onClick={nextSlide}>
      <Icon icon="keyboard_arrow_right" className={styles.Icon} />
    </div>
  );
}

RightArrow.propTypes = {
  nextSlide: PropTypes.func.isRequired
};

export default RightArrow;
