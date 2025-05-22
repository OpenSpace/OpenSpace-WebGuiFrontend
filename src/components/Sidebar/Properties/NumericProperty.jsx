import React from 'react';
import PropTypes from 'prop-types';

import NumericInput from '../../common/Input/NumericInput/NumericInput';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

function NumericProperty({ metaData, dispatcher, value }) {
  const disabled = metaData.isReadOnly;

  function onChange(newValue) {
    dispatcher.set(newValue);
  }

  const { step, max, min, exponent } = metaData.additionalData;
  // Add min & max value to description
  const enhancedDescription = { ...metaData };
  const minMaxString = `${metaData.description}\nMin: ${min}, max: ${max}`;
  enhancedDescription.description = minMaxString;
  return (
    <div className={`${disabled ? styles.disabled : ''}`}>
      <NumericInput
        value={value}
        label={<PropertyLabel metaData={enhancedDescription} />}
        placeholder={metaData.guiName}
        onValueChanged={onChange}
        step={step}
        exponent={exponent}
        max={max}
        min={min}
        disabled={disabled}
      />
    </div>
  );
}

NumericProperty.propTypes = {
  metaData: PropTypes.shape({
    identifier: PropTypes.string,
    guiName: PropTypes.string,
    isReadOnly: PropTypes.bool,
    additionalData: PropTypes.shape({
      step: PropTypes.number,
      max: PropTypes.number,
      min: PropTypes.number,
      exponent: PropTypes.number
    }),
    description: PropTypes.string
  }).isRequired,
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired
};

export default NumericProperty;
