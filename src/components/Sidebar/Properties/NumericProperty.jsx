import React, { Component } from 'react';

import NumericInput from '../../common/Input/NumericInput/NumericInput';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

class NumericProperty extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.props.dispatcher.subscribe();
  }

  componentWillUnmount() {
    this.props.dispatcher.unsubscribe();
  }

  get disabled() {
    return this.props.description.MetaData.isReadOnly;
  }

  onChange(newValue) {
    this.props.dispatcher.set(newValue);
  }

  render() {
    const { description, value } = this.props;
    const {
      SteppingValue, MaximumValue, MinimumValue, Exponent
    } = description.AdditionalData;
    // Add min & max value to description
    const enhancedDescription = { ...description };
    enhancedDescription.description = `${description.description}\nMin: ${MinimumValue}, max: ${MaximumValue}`;
    return (
      <div className={`${this.disabled ? styles.disabled : ''}`}>
        <NumericInput
          value={value}
          label={<PropertyLabel description={enhancedDescription} />}
          placeholder={description.Name}
          onValueChanged={this.onChange}
          step={SteppingValue}
          exponent={Exponent}
          max={MaximumValue}
          min={MinimumValue}
          disabled={this.disabled}
        />
      </div>
    );
  }
}

export default NumericProperty;
