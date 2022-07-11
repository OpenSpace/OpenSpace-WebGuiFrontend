import PropTypes from 'prop-types';
import React from 'react';
import styles from './MaterialIcon.scss';

/**
 * Create a Material Design icon. https://material.io/icons/
 * @param props - the props
 * @returns {XML}
 * @constructor
 */
const MaterialIcon = ({ icon, className, ...props }) => {
  return <span className={`${styles.base} ${className}`} {...props}>{ icon }</span>;
};

MaterialIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  className: PropTypes.string,
};

MaterialIcon.defaultProps = {
  className: '',
};

export default MaterialIcon;
