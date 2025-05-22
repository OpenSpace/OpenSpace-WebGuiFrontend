import React from 'react';
import PropTypes from 'prop-types';

import NumericInput from '../../common/Input/NumericInput/NumericInput';
import Row from '../../common/Row/Row';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

function MatrixProperty({ metaData, dispatcher, value }) {
  const disabled = metaData.isReadOnly;

  function onChange(index) {
    return (newValue) => {
      const stateValue = value;
      stateValue[index] = parseFloat(newValue);
      dispatcher.set(stateValue);
    };
  }

  const { step, max, min, exponent } = metaData.additionalData;
  const firstLabel = <PropertyLabel metaData={metaData} />;

  const values = value.map((val, index) => ({
    key: `${metaData.guiName}-${index}`,
    value: parseFloat(val),
    index
  }));
  // Find N
  const matrixSize = Math.sqrt(values.length);
  // actually convert into N arrays of N length
  const groups = Array.from(new Array(matrixSize), () => values.splice(0, matrixSize));

  // eslint-disable react/no-array-index-key
  return (
    <div className={`${styles.matrixProperty} ${disabled ? styles.disabled : ''}`}>
      {groups.map((group) => (
        <Row key={`row-${group[0].key}`}>
          {group.map((comp) => (
            <NumericInput
              inputOnly
              key={comp.key}
              value={comp.value}
              label={comp.index === 0 ? firstLabel : ' '}
              placeholder={`value ${comp.index}`}
              onValueChanged={onChange(comp.index)}
              exponent={exponent}
              step={step[comp.index] || 0.01}
              max={max[comp.index] || 100}
              min={min[comp.index] || -100}
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
  metaData: PropTypes.shape({
    identifier: PropTypes.string,
    guiName: PropTypes.string,
    isReadOnly: PropTypes.bool,
    additionalData: PropTypes.shape({
      step: PropTypes.arrayOf(PropTypes.number),
      max: PropTypes.arrayOf(PropTypes.number),
      min: PropTypes.arrayOf(PropTypes.number),
      exponent: PropTypes.number
    }),
    description: PropTypes.string
  }).isRequired,
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired
};

export default MatrixProperty;
