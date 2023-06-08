import React from 'react';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

import { icons } from '../../../api/resources';
import SmallLabel from '../../common/SmallLabel/SmallLabel';

import styles from './FocusButton.scss';

function FocusButton({ active, identifier, onChangeFocus }) {
  const isActive = identifier === active;

  function rednerIcon() {
    const icon = icons[identifier];
    if (icon) {
      return <img src={icon} className={styles.iconImage} alt={identifier} />;
    }
    return <Icon icon="material-symbols:language" className={styles.Icon} />;
  }

  function select() {
    onChangeFocus(identifier);
  }

  return (
    <div
      className={`${styles.FocusButton} ${isActive && styles.active}`}
      onClick={select}
      role="button"
      tabIndex="0"
    >
      { rednerIcon() }
      <SmallLabel>{identifier}</SmallLabel>
    </div>
  );
}

FocusButton.propTypes = {
  active: PropTypes.string.isRequired,
  identifier: PropTypes.string.isRequired,
  onChangeFocus: PropTypes.func.isRequired
};

export default FocusButton;
