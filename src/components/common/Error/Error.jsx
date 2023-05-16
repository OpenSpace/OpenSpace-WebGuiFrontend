import PropTypes from 'prop-types';
import React from 'react';
import styles from './Error.scss';

function Error({ children, className }) {
  return (
    <div className={`${className} ${styles.ErrorBox}`}>
      { children }
    </div>
  );
}

Error.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

Error.defaultProps = {
  className: styles.error
};

Error.styles = styles;

export default Error;
