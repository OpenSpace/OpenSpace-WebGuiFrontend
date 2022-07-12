import PropTypes from 'prop-types';
import React from 'react';
import styles from './SmallLabel.scss';

function SmallLabel(props) {
  const { children } = props;
  return (
    <span {...props} className={styles.SmallLabel}>
      { children }
    </span>
  );
}

SmallLabel.propTypes = {
  children: PropTypes.node,
};

SmallLabel.defaultProps = {
  children: [],
};

export default SmallLabel;
