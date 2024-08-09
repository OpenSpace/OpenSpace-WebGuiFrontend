import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../common/Input/Button/Button';

import styles from './TabMenuItem.scss';

function TabMenuItem({ children, onClick, active }) {
  const activeClass = active ? styles.active : '';
  return (
    <Button
      onClick={onClick}
      className={`${styles.TabMenuItem} ${activeClass}`}
      role="button"
      regular
    >
      {children}
    </Button>
  );
}

TabMenuItem.propTypes = {
  children: PropTypes.node.isRequired,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func
};

TabMenuItem.defaultProps = {
  onClick: (() => {})
};

export default TabMenuItem;
