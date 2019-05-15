import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { excludeKeys } from '../../../../utils/helpers';
import styles from './Checkbox.scss';
import MaterialIcon from '../../MaterialIcon/MaterialIcon';
import Input from '../Input/Input';

class Checkbox extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }


  onClick(evt) {
    this.props.setChecked(!this.props.checked);
    evt.stopPropagation();
  }

  render() {
    const { checked, label, wide, left } = this.props;

    return (
      <div onClick={this.onClick} className={`${styles.wrapper} ${wide ? styles.wide : ''} ${left ? styles.left : ''}`}>
        <MaterialIcon icon={checked ? "check_box" : "check_box_outline_blank"} />
        { label && <label>{ label }</label> }
      </div>
    );
  }
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
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
