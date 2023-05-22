import React from 'react';

import ColorPickerPopup from '../../common/ColorPicker/ColorPickerPopup';
import MinMaxRangeInput from '../../common/Input/MinMaxRangeInput/MinMaxRangeInput';
import NumericInput from '../../common/Input/NumericInput/NumericInput';
import Row from '../../common/Row/Row';
import { useContextRefs } from '../../GettingStartedTour/GettingStartedContext';

import PropertyLabel from './PropertyLabel';

import styles from './Property.scss';

function VectorProperty({ dispatcher, description, value }) {
  const {
    SteppingValue, MaximumValue, MinimumValue, Exponent
  } = description.AdditionalData;
  const { MetaData } = description;
  const isDisabled = MetaData.isReadOnly;
  const couldBeColor = value.length < 3 || value.length > 4;
  const isColor = couldBeColor && MetaData.ViewOptions.Color;
  const hasAlpha = isColor && value.length === 4;
  const isMinMaxRange = value.length === 2 ? MetaData.ViewOptions.MinMaxRange : false;
  // eslint-disable-next-line react/no-array-index-key
  const values = value.map((element, index) => ({
    key: `${description.Name}-${index}`, element
  }));

  function valueToColor() {
    if (!isColor) { return null; }

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

  const firstLabel = <PropertyLabel description={description} />;

  function asMinMaxRange() {
    if (!isMinMaxRange) return null;

    // Different step sizes does not make sense here, so just use the minimum
    const stepSize = Math.min(...SteppingValue);

    return (
      <Row className={`${styles.vectorProperty} ${isDisabled ? styles.disabled : ''}`}>
        <MinMaxRangeInput
          valueMin={value[0]}
          valueMax={value[1]}
          label={firstLabel}
          onMinValueChanged={onChange(0)}
          onMaxValueChanged={onChange(1)}
          step={stepSize}
          exponent={Exponent}
          max={Math.max(...MaximumValue)}
          min={Math.min(...MinimumValue)}
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
      ref={(el) => { refs.current[description.Identifier] = el; }}
      className={`${styles.vectorProperty} ${isDisabled ? styles.disabled : ''}`}
    >
      { values.map((component, index) => (
        <NumericInput
          key={component.key}
          value={component.value}
          label={index === 0 ? firstLabel : ' '}
          placeholder={`value ${index}`}
          onValueChanged={onChange(index)}
          step={SteppingValue[index]}
          exponent={Exponent}
          max={MaximumValue[index]}
          min={MinimumValue[index]}
          disabled={isDisabled}
        />
      ))}
      { isColor && (
        <ColorPickerPopup
          disableAlpha={!hasAlpha}
          color={valueToColor()}
          onChange={onColorPickerChange}
          placement="right"
          disabled={isDisabled}
        />
      )}
    </Row>
  );
}

export default VectorProperty;
