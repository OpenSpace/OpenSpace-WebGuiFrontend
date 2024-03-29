import React from 'react';
import PropTypes from 'prop-types';

import styles from './Dots.scss';

function Dot({ storyId, active, dotClick }) {
  const dotStyle = active ? styles.active : styles.Dot;

  return (
    <div
      className={dotStyle}
      role="button"
      tabIndex={0}
      onClick={() => dotClick(storyId)}
    >
      {}
    </div>
  );
}

Dot.propTypes = {
  storyId: PropTypes.number.isRequired,
  active: PropTypes.bool.isRequired,
  dotClick: PropTypes.func.isRequired
};

export default Dot;
