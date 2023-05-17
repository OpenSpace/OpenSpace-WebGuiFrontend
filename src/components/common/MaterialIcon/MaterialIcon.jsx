import React from 'react';
import PropTypes from 'prop-types';

import styles from './MaterialIcon.scss';

/**
 * Create a Material Design icon. https://material.io/icons/
 * @param props - the props
 * @returns {XML}
 * @constructor
 */
function MaterialIcon({ icon, className, ...props }) {
  return <span className={`icon ${styles.base} ${className}`} {...props}>{ icon }</span>;
}

MaterialIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  className: PropTypes.string
};

MaterialIcon.defaultProps = {
  className: ''
};

export default MaterialIcon;
