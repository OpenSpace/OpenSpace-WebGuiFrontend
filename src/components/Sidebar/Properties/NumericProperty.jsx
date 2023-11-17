import React from 'react';
import PropTypes from 'prop-types';

import NumericInput from '../../common/Input/NumericInput/NumericInput';

import PropertyLabel from './PropertyLabel';

function NumericProperty({ description, disabled, dispatcher, value }) {
  function onChange(newValue) {
    dispatcher.set(newValue);
  }

  const {
    SteppingValue, MaximumValue, MinimumValue, Exponent
  } = description.AdditionalData;
  // Add min & max value to description
  const enhancedDescription = { ...description };
  const minMaxString = `${description.description}\nMin: ${MinimumValue}, max: ${MaximumValue}`;
  enhancedDescription.description = minMaxString;
  return (
    <NumericInput
      value={value}
      label={<PropertyLabel description={enhancedDescription} />}
      placeholder={description.Name}
      onValueChanged={onChange}
      step={SteppingValue}
      exponent={Exponent}
      max={MaximumValue}
      min={MinimumValue}
      disabled={disabled}
    />
  );
}

NumericProperty.propTypes = {
  description: PropTypes.shape({
    Identifier: PropTypes.string,
    Name: PropTypes.string,
    MetaData: PropTypes.shape({
      isReadOnly: PropTypes.bool
    }),
    AdditionalData: PropTypes.shape({
      SteppingValue: PropTypes.number,
      MaximumValue: PropTypes.number,
      MinimumValue: PropTypes.number,
      Exponent: PropTypes.number
    }),
    description: PropTypes.string
  }).isRequired,
  disabled: PropTypes.bool.isRequired,
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired
};

export default NumericProperty;
