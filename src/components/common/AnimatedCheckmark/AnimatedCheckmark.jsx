import React from 'react';

import styles from './AnimatedCheckmark.scss';

function AnimatedCheckmark({ color, isAnimated = true, ...props }) {
  return (
    <div {...props}>
      <svg className={`${styles.checkmark} ${isAnimated && styles.checkmarkAnimated}`} style={{ color }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle className={`${styles.checkmarkCircle} ${isAnimated && styles.checkmarkCircleAnimated}`} cx="26" cy="26" r="25" fill="none" />
        <path className={`${styles.checkmarkCheck} ${isAnimated && styles.checkmarkCheckAnimated}`} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      </svg>
    </div>
  );
}

export default AnimatedCheckmark;
