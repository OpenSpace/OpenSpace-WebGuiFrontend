import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../../common/MaterialIcon/MaterialIcon';
import styles from './Arrows.scss';

const LeftArrow = ({ prevSlide }) => (
  <div className={styles.LeftArrow} onClick={prevSlide} >
    <Icon icon="keyboard_arrow_left" className={styles.Icon} />
  </div>
);

LeftArrow.propTypes = {
  prevSlide: PropTypes.func.isRequired,
};

export default LeftArrow;
