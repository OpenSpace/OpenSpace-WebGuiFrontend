import React from 'react';
import PropTypes from 'prop-types';
import styles from './SkyBrowserTooltip.scss';

function SkyBrowserTooltip({ placement, fixed, children, ...props }) {
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
  placement: PropTypes.oneOf('bottom-left bottom-right'.split(' ')),
  fixed: PropTypes.bool,
};

SkyBrowserTooltip.defaultProps = {
  placement: 'top',
  fixed: false,
};

export default SkyBrowserTooltip;
