import React from 'react';
import PropTypes from 'prop-types';

import styles from './Row.scss';

const Row = React.forwardRef(({ children, className = '', ...props}, ref) => (
  <div className={styles.rowWrapper}>
    <div ref={ref} {...props} className={`${styles.row} ${className}`}>
      { children }
    </div>
  </div>
));

Row.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default Row;
