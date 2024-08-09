import React from 'react';
import PropTypes from 'prop-types';


import styles from './LoadingBlock.scss';

function LoadingBlock({ loading = false, ...props}) {
  return (<div className={styles.block} {...props} />);
}

LoadingBlock.propTypes = {
  loading: PropTypes.bool
};

export default LoadingBlock;
