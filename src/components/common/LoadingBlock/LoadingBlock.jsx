import PropTypes from 'prop-types';
import React from 'react';
import { excludeKeys } from '../../../utils/helpers';
import styles from './LoadingBlock.scss';

function LoadingBlock(props) {
  const inherit = excludeKeys(props, 'loading');
  return (<div className={styles.block} {...inherit} />);
}

LoadingBlock.propTypes = {
  loading: PropTypes.bool,
};

LoadingBlock.defaultProps = {
  loading: false,
};

export default LoadingBlock;
