import React from 'react';
import PropTypes from 'prop-types';
import MaterialIcon from '../MaterialIcon/MaterialIcon';

import styles from './ToggleHeader.scss';

const ToggleHeader = ({ title, toggled, onClick, onIcon, offIcon, showEnabled, children}) => (
  <header className={styles.toggle} onClick={onClick} role="button" tabIndex={0}>
    <div className={styles.headerChildren}>{children}</div>
    <MaterialIcon
      icon={toggled ? onIcon : offIcon}
      className={styles.icon}
    />
    <span className={`${styles.title} ${ showEnabled ? styles.layerenabled: ""}`} >
      { title }
    </span>
  </header>
);

ToggleHeader.propTypes = {
  children: PropTypes.node,
  offIcon: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  onIcon: PropTypes.string,
  title: PropTypes.string.isRequired,
  showEnabled: PropTypes.bool,
  toggled: PropTypes.bool.isRequired,
};

ToggleHeader.defaultProps = {
  offIcon: 'chevron_right',
  onIcon: 'expand_more',
};

export default ToggleHeader;
