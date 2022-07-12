import PropTypes from 'prop-types';
import React from 'react';
import styles from './Row.scss';

function Row(props) {
  return (
    <div {...props} className={`${styles.row} ${props.className}`}>
      { props.children }
    </div>
  );
}

Row.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Row.defaultProps = {
  className: '',
};

export default Row;
