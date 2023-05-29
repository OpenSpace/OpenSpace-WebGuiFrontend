import React from 'react';
import PropTypes from 'prop-types';

import NumericInput from '../../common/Input/NumericInput/NumericInput';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

function NumericProperty({ description, dispatcher, value }) {
  const disabled = description.MetaData.isReadOnly;

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
    <div className={`${disabled ? styles.disabled : ''}`}>
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
    </div>
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
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired
};

export default NumericProperty;
