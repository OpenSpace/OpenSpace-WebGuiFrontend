import React, { Component } from 'react';
import PropTypes from 'prop-types';

import MaterialIcon from '../../MaterialIcon/MaterialIcon';
import Button from '../Button/Button';

import styles from './Checkbox.scss';

class Checkbox extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick(evt) {
    if (this.props.disabled) {
      return;
    }
    this.props.setChecked(!this.props.checked, evt);
    evt.stopPropagation();
  }

  render() {
    const {
      checked, wide, left, className, setChecked, children, ...rest
    } = this.props;

    return (
      <Button
        onClick={this.onClick}
        className={`${styles.wrapper} ${className} ${wide ? styles.wide : ''} ${left ? styles.left : ''}`}
        {...rest}
      >
        <MaterialIcon
          className={styles.checkbox}
          icon={checked ? 'check_box' : 'check_box_outline_blank'}
        />
        { children }
      </Button>
    );
  }
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  left: PropTypes.bool,
  onChange: PropTypes.func,
  setChecked: PropTypes.func.isRequired,
  value: PropTypes.bool,
  wide: PropTypes.bool
};

Checkbox.defaultProps = {
  checked: false,
  disabled: false,
  left: false,
  onChange: () => {},
  value: false,
  wide: true
};

export default Checkbox;
