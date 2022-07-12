import PropTypes from 'prop-types';
import React, { Component } from 'react';
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
    this.props.setChecked(!this.props.checked);
    evt.stopPropagation();
  }

  render() {
    const {
      checked, label, wide, left, className,
    } = this.props;

    return (
      <div onClick={this.onClick} className={`${styles.wrapper} ${className} ${wide ? styles.wide : ''} ${left ? styles.left : ''}`}>
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
  wide: PropTypes.bool,
};

Checkbox.defaultProps = {
  checked: false,
  left: false,
  onChange: () => {},
  value: false,
  wide: true,
};

export default Checkbox;
