import React from 'react';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import PropTypes from 'prop-types';

import Button from '../Button/Button';

import styles from './Checkbox.scss';

function Checkbox({
  checked = false,
  children = [],
  className = '',
  disabled = false,
  left = false,
  setChecked,
  wide = true,
  ...rest
}) {
  function onClick(evt) {
    if (disabled) {
      return;
    }
    setChecked(!checked, evt);
    evt.stopPropagation();
  }

  return (
    <Button
      onClick={onClick}
      className={`${styles.wrapper} ${className} ${wide ? styles.wide : ''} ${left ? styles.left : ''}`}
      {...rest}
      regular
    >
      {checked ?
        <MdCheckBox className={styles.checkbox} /> :
        <MdCheckBoxOutlineBlank className={styles.checkbox} />}
      { children }
    </Button>
  );
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  left: PropTypes.bool,
  setChecked: PropTypes.func.isRequired,
  value: PropTypes.bool,
  wide: PropTypes.bool
};

export default Checkbox;
