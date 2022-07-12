import PropTypes from 'prop-types';
import React from 'react';
import styles from './TabMenu.scss';

function TabMenu({ children }) {
  return (
    <nav className={styles.TabMenu}>
      { children }
    </nav>
  );
}

TabMenu.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TabMenu;
