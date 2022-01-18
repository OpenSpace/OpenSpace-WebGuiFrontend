import PropTypes from 'prop-types';
import React from 'react';
import styles from './MaterialIcon.scss';

/**
 * Create a Material Design icon. https://material.io/icons/
 * @param props - the props
 * @returns {XML}
 * @constructor
 */
const MaterialIcon = (props) => {
  const { icon, className } = props;
  const classNames = className.split(' ')
                            .map(s => styles[s] || s)
                            .concat(styles.base)
                            .join(' ');
  return (
    <i {...props} className={classNames}>{ icon }</i>
  );
};

MaterialIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  className: PropTypes.string,
};

MaterialIcon.defaultProps = {
  className: '',
};

export default MaterialIcon;
