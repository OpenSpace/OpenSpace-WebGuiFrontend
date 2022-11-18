import React from 'react';
import PropTypes from 'prop-types';
import styles from './SkyBrowserTooltip.scss';

function SkyBrowserTooltip({ children, fixed, placement, ...props }) {
  return (
    <div
      {...props}
      className={`${styles.tooltip} ${styles[placement]} ${fixed && styles.fixed}`}
    >
      <div className={styles.content}>
        { children }
      </div>
    </div>
  );
};

SkyBrowserTooltip.propTypes = {
  children: PropTypes.node.isRequired,
  fixed: PropTypes.bool,
  placement: PropTypes.oneOf('bottom-left bottom-right'.split(' ')),
};

SkyBrowserTooltip.defaultProps = {
  placement: 'top',
  fixed: false,
};

export default SkyBrowserTooltip;
