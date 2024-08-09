import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../common/Input/Button/Button';

import styles from './TabMenuItem.scss';

function TabMenuItem({ active, children, onClick = () => {} }) {
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
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func
};

export default TabMenuItem;
