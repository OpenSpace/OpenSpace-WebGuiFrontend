import React from 'react';
import PropTypes from 'prop-types';
import styles from './TooltipSkybrowser.scss';
import { excludeKeys } from '../../utils/helpers';

const TooltipSkybrowser = (props) => {
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
};

TooltipSkybrowser.propTypes = {
  children: PropTypes.node.isRequired,
  placement: PropTypes.oneOf('bottom-left bottom-right'.split(' ')),
  fixed: PropTypes.bool,
};

TooltipSkybrowser.defaultProps = {
  placement: 'top',
  fixed: false,
};

export default TooltipSkybrowser;
