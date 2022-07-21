import PropTypes from 'prop-types';
import React from 'react';
import styles from './Row.scss';

const Row =  React.forwardRef((props, ref) => (
  <div className={styles.rowWrapper}>
    <div ref={ref} {...props} className={`${styles.row} ${props.className}`}>
      { props.children }
    </div>
  </div>
));

Row.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Row.defaultProps = {
  className: '',
};

export default Row;
