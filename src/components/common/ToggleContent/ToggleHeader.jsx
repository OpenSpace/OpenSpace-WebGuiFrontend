import React from 'react';
import PropTypes from 'prop-types';
import MaterialIcon from '../MaterialIcon/MaterialIcon';

import styles from './ToggleHeader.scss';

const ToggleHeader = ({ title, expanded, onClick, onIcon, offIcon, showEnabled }) => (
  <header className={styles.toggle} onClick={onClick} role="button" tabIndex={0}>
    <MaterialIcon
      icon={expanded ? onIcon : offIcon}
      className={styles.icon}
    />
    <span className={`${styles.title}`} >
      { title }
    </span>
  </header>
);

ToggleHeader.propTypes = {
  offIcon: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  onIcon: PropTypes.string,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]).isRequired,
  showEnabled: PropTypes.bool,
  expanded: PropTypes.bool.isRequired,
};

ToggleHeader.defaultProps = {
  offIcon: 'chevron_right',
  onIcon: 'expand_more',
};

export default ToggleHeader;
