import React, { Component } from 'react';
import PropTypes from 'prop-types';

import MaterialIcon from '../../MaterialIcon/MaterialIcon';

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
      checked, label, wide, left, className, setChecked, ...rest
    } = this.props;

    return (
      <div onClick={this.onClick} className={`${styles.wrapper} ${className} ${wide ? styles.wide : ''} ${left ? styles.left : ''}`} {...rest}>
        <MaterialIcon className={styles.checkbox} icon={checked ? 'check_box' : 'check_box_outline_blank'} />
        { label && <label>{ label }</label> }
      </div>
    );
  }
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  setChecked: PropTypes.func,
  label: PropTypes.node,
  left: PropTypes.bool,
  value: PropTypes.bool,
  wide: PropTypes.bool
};

Checkbox.defaultProps = {
  checked: false,
  left: false,
  onChange: () => {},
  value: false,
  wide: true
};

export default Checkbox;
