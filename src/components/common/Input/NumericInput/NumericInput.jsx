import React from 'react';
import { clamp } from 'lodash/number';
import PropTypes from 'prop-types';

import { roundValueToStepSize } from '../../../../utils/rounding';
import Tooltip from '../../Tooltip/Tooltip';
import Input from '../Input/Input';

import styles from './NumericInput.scss';

const Scale = require('d3-scale');

function NumericInput({
  className = '',
  decimals = undefined,
  disabled = false,
  exponent = 1.0,
  inputOnly = false,
  label = null,
  max = 100,
  min = 0,
  noHoverHint = false,
  noTooltip = false,
  noValue = false,
  onValueChanged = () => {},
  placeholder,
  reverse = false,
  showOutsideRangeHint = true,
  step = 1,
  value = 0,
  wide = true,
  ...props
}) {
  const [storedValue, setStoredValue] = React.useState(value);
  const [showTextInput, setShowTextInput] = React.useState(false);
  const [hoverHint, setHoverHint] = React.useState(null);
  const [isValueOutsideRange, setIsValueOutsideRange] = React.useState(value < min || value > max);
  const [enteredInvalidValue, setEnteredInvalidValue] = React.useState(false);

  const id = React.useRef(`numericinput-${Input.nextId}`);
  const sliderResolution = React.useRef(10000);
  const scale = React.useRef(null);
  const wrapperRef = React.useRef(null);

  React.useEffect(() => {
    setStoredValue(value);
  }, [value]);

  // The useMemo hook is called before first render. This will initialize the refs
  React.useMemo(() => {
    // Prevent setting exponent to zero, as it breaks the scale
    const exp = (exponent === 0) ? 1.0 : exponent;

    // If linear scale, we want the resolution to match the step size
    if (exp === 1.0) {
      let nSteps = Math.ceil((max - min) / step);
      if (!Number.isFinite(nSteps)) {
        nSteps = 1000;
      }
      sliderResolution.current = nSteps;
    }

    // The slider is logarithmic, but the scaling of the value increases exponentially
    scale.current = Scale.scalePow()
      .exponent(exp)
      .domain([0, sliderResolution.current]) // slider pos
      .range([min, max]); // allowed values
  }, [min, max, step, exponent]);

  function valueFromSliderPos(sliderValue) {
    const scaledValue = scale.current(sliderValue);
    // If almost max, return max, as rounding will prevent this if the step size
    // is not well chosen
    if (scaledValue > 0.999 * max) {
      return max;
    }
    return roundValueToStepSize(scaledValue, step);
  }

  function updateValue(inValue) {
    const isValueOutsideRangeNow = inValue < min || inValue > max;

    // Update state so that input is re-rendered with new content - optimistic ui change
    setIsValueOutsideRange(isValueOutsideRangeNow);
    setStoredValue(inValue);

    // Send to the onChange (if any)!
    onValueChanged(inValue);
  }

  /**
   * callback for input
   * @param event InputEvent
   */
  function onSliderChange(event) {
    // If we are in inputOnly mode, ignore any slide input
    if (inputOnly) {
      return;
    }

    const sliderValue = Number.parseFloat(event.currentTarget.value);
    let newValue = valueFromSliderPos(sliderValue);
    // Clamp to min max range (should no be needed, but do anyways just ot be sure)
    newValue = Math.min(Math.max(newValue, min), max);

    updateValue(newValue);
  }

  function onHover(event) {
    if (disabled) {
      return;
    }

    // get bounds for input to calc hover percentage
    const { left, right } = event.currentTarget.getBoundingClientRect();
    const { clientX } = event;
    const newHoverHint = clamp((clientX - left) / (right - left), 0, 1);
    setHoverHint(newHoverHint);
  }

  function onLeave() {
    setHoverHint(null);
  }

  function onTextBlurOrEnter(event) {
    const newValue = Number.parseFloat(event.currentTarget.value);
    if (!Number.isNaN(newValue)) {
      updateValue(newValue);
    }
    setShowTextInput(false);
    setHoverHint(null);
    event.currentTarget.blur();
  }

  function onTextInputChange(event) {
    // Validate the test input
    const newValue = Number.parseFloat(event.currentTarget.value);
    const isValueOutsideRangeNow = newValue < min || newValue > max;
    const enteredNanValue = Number.isNaN(newValue) || !Number.isFinite(newValue);

    if (isValueOutsideRange !== isValueOutsideRangeNow) {
      setIsValueOutsideRange(isValueOutsideRangeNow);
    }

    if (enteredInvalidValue !== enteredNanValue) {
      setEnteredInvalidValue(enteredNanValue);
    }
  }

  function valueToSliderPos(inValue) {
    return scale.current.invert(inValue);
  }

  function enableTextInput() {
    if (disabled) {
      return;
    }
    setShowTextInput(true);
    setHoverHint(false);
    setEnteredInvalidValue(false);
  }

  function textTooltipPosition() {
    if (!wrapperRef.current) return { top: '0px', left: '0px' };
    const { top, right } = wrapperRef.current.getBoundingClientRect();
    return { top: `${top}px`, left: `${right}px` };
  }

  function textInput() {
    // If we are already outside the range, exclude the min max properties to the HTML
    // input. But while inside the range we want them to affect what value is possible
    // to set using e.g. the arrow keys
    const currentMin = isValueOutsideRange ? null : min;
    const currentMax = isValueOutsideRange ? null : max;

    // Styling
    const outsideRangeStyles = `${isValueOutsideRange && styles.outsideMinMaxRange}`;
    const invalidStyles = `${enteredInvalidValue && styles.invalidValue}`;
    const tooltipStyles = `${outsideRangeStyles} ${invalidStyles}`;

    const valueIsBad = isValueOutsideRange || enteredInvalidValue;
    return (
      <div className={`${styles.inputGroup} ${wide ? styles.wide : ''}`} ref={wrapperRef}>
        <Input
          className={`${className} ${tooltipStyles}`}
          type="number"
          value={storedValue}
          onBlur={onTextBlurOrEnter}
          onChange={onTextInputChange}
          onEnter={onTextBlurOrEnter}
          placeholder={placeholder}
          wide={wide}
          label={label}
          min={currentMin}
          max={currentMax}
          step={step}
          autoFocus
        />
        {showOutsideRangeHint && valueIsBad && (
          <Tooltip className={tooltipStyles} fixed style={{ ...textTooltipPosition() }} placement="right">
            {isValueOutsideRange && (
              <p>
                {`Value is outside the valid range: `}
                <b>{`[${min}, ${max}].`}</b>
              </p>
            )}
            {enteredInvalidValue && (
              <p>Value is not a number</p>
            )}
          </Tooltip>
        )}
      </div>
    );
  }

  function numericInput() {
    const hoverHintOffset = reverse ? 1 - hoverHint : hoverHint;

    const sliderValue = valueToSliderPos(storedValue);
    // HoverHintOffset is in [0, 1]. Scale to full slider range
    const scaledHoverHintOffset = sliderResolution.current * hoverHintOffset;
    const tooltipValue = valueFromSliderPos(scaledHoverHintOffset);
    const displayValue = decimals ? storedValue.toFixed(decimals) : storedValue;

    const sliderStyle = (inputOnly) ? {} :
      {
        '--min': 0,
        '--max': sliderResolution.current,
        '--value': sliderValue,
        direction: reverse ? 'rtl' : 'ltr'
      };

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className={`${styles.inputGroup} ${wide ? styles.wide : ''} ${reverse ? styles.reverse : ''}`}
        ref={wrapperRef}
        onDoubleClick={enableTextInput}
        onClick={(event) => {
          if (inputOnly) {
            enableTextInput(event);
            event.stopPropagation();
          }
        }}
        onContextMenu={enableTextInput}
      >
        { !noHoverHint && hoverHint !== null && !inputOnly && (
          <div className={styles.hoverHint} style={{ width: `${100 * hoverHintOffset}%` }} />
        )}
        { !noTooltip && hoverHint !== null && (
          <Tooltip style={{ left: `${100 * hoverHint}%` }} placement="top">
            { tooltipValue }
          </Tooltip>
        )}
        <input
          {...props}
          placeholder={placeholder}
          disabled={disabled}
          id={id.current}
          type="range"
          value="test"
          min={0}
          max={sliderResolution.current}
          step={1}
          className={`${className} ${styles.range}`}
          style={sliderStyle}
          onClickCapture={(event) => {
            if (!inputOnly) {
              event.stopPropagation();
            }
          }}
          onChange={onSliderChange}
          onMouseMove={onHover}
          onMouseLeave={onLeave}
        />
        <label htmlFor={id.current} className={`${styles.rangeLabel}`}>
          { label || placeholder }
        </label>
        <span className={styles.value}>
          {noValue ? '' : displayValue}
        </span>
      </div>
    );
  }

  return showTextInput ? textInput() : numericInput();
}

NumericInput.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  exponent: PropTypes.number,
  inputOnly: PropTypes.bool,
  label: PropTypes.node,
  max: PropTypes.number,
  min: PropTypes.number,
  reverse: PropTypes.bool,
  noHoverHint: PropTypes.bool,
  noTooltip: PropTypes.bool,
  noValue: PropTypes.bool,
  onValueChanged: PropTypes.func,
  placeholder: PropTypes.string.isRequired,
  showOutsideRangeHint: PropTypes.bool,
  step: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  wide: PropTypes.bool,
  decimals: PropTypes.number
};

export default NumericInput;
