import PropTypes from 'prop-types';
import React from 'react';
import styles from './Stack.scss';

function Stack(props) {
  return (
    <div {...props} className={`${styles.stack} ${props.className}`}>
      { props.children }
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
