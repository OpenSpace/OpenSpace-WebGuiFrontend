import React from 'react';
import PropTypes from 'prop-types';

import NumericInput from '../../common/Input/NumericInput/NumericInput';
import Row from '../../common/Row/Row';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

function MatrixProperty({ description, disabled, dispatcher, value }) {
  function onChange(index) {
    return (newValue) => {
      const stateValue = value;
      stateValue[index] = parseFloat(newValue);
      dispatcher.set(stateValue);
    };
  }

  const {
    SteppingValue, MaximumValue, MinimumValue, Exponent
  } = description.AdditionalData;
  const firstLabel = <PropertyLabel description={description} />;

  const values = value.map((val, index) => ({
    key: `${description.Name}-${index}`,
    value: parseFloat(val),
    index
  }));
  // Find N
  const matrixSize = Math.sqrt(values.length);
  // actually convert into N arrays of N length
  const groups = Array.from(new Array(matrixSize), () => values.splice(0, matrixSize));

  // eslint-disable react/no-array-index-key
  return (
    <div className={`${styles.matrixProperty}`}>
      { groups.map((group) => (
        <Row key={`row-${group[0].key}`}>
          { group.map((comp) => (
            <NumericInput
              inputOnly
              key={comp.key}
              value={comp.value}
              label={comp.index === 0 ? firstLabel : ' '}
              placeholder={`value ${comp.index}`}
              onValueChanged={onChange(comp.index)}
              exponent={Exponent}
              step={SteppingValue[comp.index] || 0.01}
              max={MaximumValue[comp.index] || 100}
              min={MinimumValue[comp.index] || -100}
              disabled={disabled}
              noTooltip
            />
          ))}
        </Row>
      ))}
    </div>
  );
}

MatrixProperty.propTypes = {
  description: PropTypes.shape({
    Identifier: PropTypes.string,
    Name: PropTypes.string,
    MetaData: PropTypes.shape({
      isReadOnly: PropTypes.bool
    }),
    AdditionalData: PropTypes.shape({
      SteppingValue: PropTypes.arrayOf(PropTypes.number),
      MaximumValue: PropTypes.arrayOf(PropTypes.number),
      MinimumValue: PropTypes.arrayOf(PropTypes.number),
      Exponent: PropTypes.number
    }),
    description: PropTypes.string
  }).isRequired,
  disabled: PropTypes.bool.isRequired,
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired
};

export default MatrixProperty;
