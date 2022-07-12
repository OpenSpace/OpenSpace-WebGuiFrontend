import React from 'react';
import PropTypes from 'prop-types';
import styles from './SkyBrowserTooltip.scss';
import { excludeKeys } from '../../../utils/helpers';

function SkyBrowserTooltip(props) {
  const { children, placement, fixed } = props;
  return (
    <div
      {...excludeKeys(props, 'placement fixed')}
      className={`${styles.tooltip} ${styles[placement]} ${fixed && styles.fixed}`}
    >
      <div className={styles.content}>
        { children }
      </div>
    </div>
  );
}

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
