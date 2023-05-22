import React, { Component } from 'react';

import Checkbox from '../../common/Input/Checkbox/Checkbox';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

class BoolProperty extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    this.props.dispatcher.set(value);
  }

  get disabled() {
    return this.props.description.MetaData.isReadOnly;
  }

  render() {
    const { description, value } = this.props;
    const showText = !this.props.checkBoxOnly;

    return (
      <div className={`${this.disabled ? styles.disabled : ''}`}>
        <Checkbox
          wide={!this.props.checkBoxOnly}
          checked={value}
          setChecked={this.onChange}
          disabled={this.disabled}
        >
          {showText && <PropertyLabel description={description} />}
        </Checkbox>
      </div>
    );
  }
}

export default BoolProperty;
