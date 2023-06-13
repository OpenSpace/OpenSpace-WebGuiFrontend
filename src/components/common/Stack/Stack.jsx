import React from 'react';
import PropTypes from 'prop-types';

import styles from './Stack.scss';

function Stack({ className, children, ...props }) {
  return (
    <div {...props} className={`${styles.stack} ${className}`}>
      { children }
    </div>
  );
}

Stack.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

Stack.defaultProps = {
  className: ''
};

export default Stack;
