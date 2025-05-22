import React from 'react';
import PropTypes from 'prop-types';

import ColorPickerPopup from '../../common/ColorPicker/ColorPickerPopup';
import MinMaxRangeInput from '../../common/Input/MinMaxRangeInput/MinMaxRangeInput';
import NumericInput from '../../common/Input/NumericInput/NumericInput';
import Row from '../../common/Row/Row';
import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

function VectorProperty({ dispatcher, metaData, value }) {
  const { step, max, min, exponent } = metaData.additionalData;
  const isDisabled = metaData.isReadOnly;
  const couldBeColor = value.length <= 4 && value.length > 2;
  const isColor = couldBeColor && metaData.viewOptions?.Color;
  const hasAlpha = isColor && value.length === 4;
  const isMinMaxRange = value.length === 2 ? metaData.viewOptions?.MinMaxRange : false;

  // eslint-disable-next-line react/no-array-index-key
  const values = value.map((element, index) => ({
    key: `${metaData.guiName}-${index}`,
    value: element
  }));

  function valueToColor() {
    if (!isColor) {
      return null;
    }

    return {
      r: value[0] * 255,
      g: value[1] * 255,
      b: value[2] * 255,
      a: hasAlpha ? value[3] : 1.0
    };
  }

  function onChange(index) {
    return (newValue) => {
      const stateValue = value;

      stateValue[index] = parseFloat(newValue);
      dispatcher.set(stateValue);
    };
  }

  function onColorPickerChange(color) {
    const { rgb } = color;
    let newValue = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    if (hasAlpha) {
      newValue[3] = rgb.a;
    }
    // Avoid creating numbers with lots of decimals
    newValue = newValue.map((v) => parseFloat(v.toFixed(3)));

    dispatcher.set(newValue);
  }

  const firstLabel = <PropertyLabel metaData={metaData} />;

  function asMinMaxRange() {
    if (!isMinMaxRange) return null;

    // Different step sizes does not make sense here, so just use the minimum
    const stepSize = Math.min(...step);

    return (
      <Row className={`${styles.vectorProperty} ${isDisabled ? styles.disabled : ''}`}>
        <MinMaxRangeInput
          valueMin={value[0]}
          valueMax={value[1]}
          label={firstLabel}
          onMinValueChanged={onChange(0)}
          onMaxValueChanged={onChange(1)}
          step={stepSize}
          exponent={exponent}
          max={Math.max(...max)}
          min={Math.min(...min)}
          disabled={isDisabled}
        />
      </Row>
    );
  }

  if (isMinMaxRange) {
    return asMinMaxRange();
  }
  const refs = useContextRefs();
  return (
    <Row
      ref={(el) => {
        refs.current[metaData.identifier] = el;
      }}
      className={`${styles.vectorProperty} ${isDisabled ? styles.disabled : ''}`}
    >
      {values.map((component, index) => (
        <NumericInput
          key={component.key}
          value={component.value}
          label={index === 0 ? firstLabel : ' '}
          placeholder={`value ${index}`}
          onValueChanged={onChange(index)}
          step={step[index]}
          exponent={exponent}
          max={max[index]}
          min={min[index]}
          disabled={isDisabled}
        />
      ))}
      {isColor && (
        <ColorPickerPopup
          disableAlpha={!hasAlpha}
          color={valueToColor()}
          onChange={onColorPickerChange}
          placement='right'
          disabled={isDisabled}
        />
      )}
    </Row>
  );
}

VectorProperty.propTypes = {
  metaData: PropTypes.shape({
    identifier: PropTypes.string,
    guiName: PropTypes.string,
    isReadOnly: PropTypes.bool,
    viewOptions: PropTypes.object,
    additionalData: PropTypes.shape({
      step: PropTypes.arrayOf(PropTypes.number),
      max: PropTypes.arrayOf(PropTypes.number),
      min: PropTypes.arrayOf(PropTypes.number),
      exponent: PropTypes.number
    }),
    description: PropTypes.string
  }).isRequired,
  dispatcher: PropTypes.object.isRequired,
  value: PropTypes.array.isRequired
};
export default VectorProperty;
