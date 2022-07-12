import PropTypes from 'prop-types';
import React from 'react';
import styles from './Dots.scss';

function Dot({ storyId, active, dotClick }) {
  const dotStyle = active ? styles.active : styles.Dot;

  return (
    <div
      className={dotStyle}
      role="button"
      tabIndex={0}
      onClick={() => dotClick(storyId)}
    />
  );
}

Dot.propTypes = {
  storyId: PropTypes.number.isRequired,
  active: PropTypes.bool.isRequired,
  dotClick: PropTypes.func.isRequired,
};

export default Dot;
