import React from 'react';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';

import Button from '../Button/Button';

import styles from './Checkbox.scss';

function Checkbox({
  checked, disabled, wide, left, className, setChecked, children, ...rest
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
      <Icon
        className={styles.checkbox}
        icon={checked ? 'material-symbols:check-box' : 'material-symbols:check-box-outline-blank'}
      />
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
  onChange: PropTypes.func,
  setChecked: PropTypes.func.isRequired,
  value: PropTypes.bool,
  wide: PropTypes.bool
};

Checkbox.defaultProps = {
  checked: false,
  children: [],
  className: '',
  disabled: false,
  left: false,
  onChange: () => {},
  value: false,
  wide: true
};

export default Checkbox;
