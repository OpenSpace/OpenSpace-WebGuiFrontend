import React from 'react';
import { clamp } from 'lodash/number';
import PropTypes from 'prop-types';

import { roundValueToStepSize } from '../../../../utils/rounding';
import Row from '../../Row/Row';
import Tooltip from '../../Tooltip/Tooltip';
import Input from '../Input/Input';

import styles from './MinMaxRangeInput.scss';

const Scale = require('d3-scale');

function MinMaxRangeInput({
  valueMin, valueMax, min, max, disabled, inputOnly, exponent, step, onMinValueChanged, onMaxValueChanged,
  placeholder, label, className, wide, noHoverHint, noTooltip, noValue, type, ...props
}) {
  const [minValue, setMinValue] = React.useState(valueMin);
  const [maxValue, setMaxValue] = React.useState(valueMax);
  const [id, setId] = React.useState(`minmaxrangeinput-${Input.nextId}`);
  const [hoverHint, setHoverHint] = React.useState(null);
  const [hoverHintStyle, setHoverHintStyle] = React.useState({});
  const [showTextInput, setShowTextInput] = React.useState(false);
  const [focusLeftTextInput, setFocusLeftTextInput] = React.useState(null);
  const [isMinValueOutsideRange, setIsMinValueOutsideRange] = React.useState(valueMin < min || valueMin > max,);
  const [isMaxValueOutsideRange, setIsMaxValueOutsideRange] = React.useState(valueMax < min || valueMax > max);
  const [enteredInvalidMinValue, setEnteredInvalidMinValue] = React.useState(false);
  const [enteredInvalidMaxValue, setEnteredInvalidMaxValue] = React.useState(false);

  const wrapperRef = React.useRef(null);
  const minSliderRef = React.useRef(null);
  const maxSliderRef = React.useRef(null);

  let sliderResolution = 10000;
  let scale = updateSliderScale();

  React.useState(() => {
    setMinValue(valueMin);
  }, [valueMin]);

  React.useState(() => {
    setMaxValue(valueMax);
  }, [valueMax]);

  React.useState(() => {
    scale = updateSliderScale();
  }, [min, max, step, exponent]);

  function onMinTextInputChanged(event) {
    // Validate the test input
    const value = Number.parseFloat(event.currentTarget.value);
    const isMinValueOutsideRangeNow = value < min || value > max;
    const enteredNanValueNow = Number.isNaN(value) || !Number.isFinite(value);

    if (isMinValueOutsideRange !== isMinValueOutsideRangeNow) {
      setIsMinValueOutsideRange(isMinValueOutsideRangeNow);
    }

    if (enteredInvalidMinValue !== enteredNanValueNow) {
      setEnteredInvalidMinValue({ enteredInvalidMinValue: enteredNanValueNow });
    }
  }

  function onMaxTextInputChanged(event) {
    // Validate the test input
    const value = Number.parseFloat(event.currentTarget.value);
    const isMaxValueOutsideRangeNow = value < min || value > max;
    const enteredNanValueNow = Number.isNaN(value) || !Number.isFinite(value);

    if (isMaxValueOutsideRange !== isMaxValueOutsideRangeNow) {
      setIsMaxValueOutsideRange(isMaxValueOutsideRangeNow);
    }

    if (enteredInvalidMaxValue !== enteredNanValueNow) {
      setEnteredInvalidMaxValue(enteredNanValueNow);
    }
  }

  function onMouseMove(event) {
    if (disabled) {
      return;
    }

    // Get bounds for input to compute hover percentage
    const { left, right } = event.currentTarget.getBoundingClientRect();
    const { clientX } = event;
    const hoverHintNow = clamp((clientX - left) / (right - left), 0, 1);
    setHoverHint(hoverHintNow);

    // Handle other things that depend on mouse position, such as which slider
    // should be on top and the styling of the hint bar

    // We have to map the value to the slider scale, to get the correct position
    const scaledMinValue = valueToSliderPos(minValue);
    const scaledMaxValue = valueToSliderPos(maxValue);
    const normalizedMinValue = scaledMinValue / sliderResolution;
    const normalizedMaxValue = scaledMaxValue / sliderResolution;

    // Style for hint bar
    let styleLeft = 0;
    let styleWidth = 0;

    // @TODO (emmbr, 2021-05-25): potentially make the hint account for when the
    // mouse is down, to avoid showing faulty hints when dragging slider handle

    const onTop = '4';
    const onBottom = '3';

    const putRightSliderOnTop = () => {
      maxSliderRef.current.style.zIndex = onTop;
      minSliderRef.current.style.zIndex = onBottom;

      styleLeft = normalizedMinValue;
      styleWidth = hoverHint - normalizedMinValue;
    };

    const putLeftSliderOnTop = () => {
      minSliderRef.current.style.zIndex = onTop;
      maxSliderRef.current.style.zIndex = onBottom;

      styleLeft = hoverHint;
      styleWidth = normalizedMaxValue - hoverHint;
    };

    if (hoverHint < normalizedMinValue) { // mouse < minValue
      putLeftSliderOnTop();
    } else if (hoverHint < normalizedMaxValue) { // minValue < mouse < maxValue
      // Pick the closest handle
      const leftDistance = hoverHint - normalizedMinValue;
      const rightDistance = normalizedMaxValue - hoverHint;

      if (leftDistance < rightDistance) { // closer to the left
        putLeftSliderOnTop();
      } else { // closer to the right
        putRightSliderOnTop();
      }
    } else { // mouse > maxValue
      putRightSliderOnTop();
    }

    const newHoverHintStyle = {
      width: `${100 * styleWidth}%`,
      left: `${100 * styleLeft}%`
    };

    setHoverHintStyle(newHoverHintStyle);
  }

  function onLeave() {
    setHoverHint(null);
  }

  function onMinTextBlur(event) {
    const value = Number.parseFloat(event.currentTarget.value);
    if (!Number.isNaN(value)) {
      updateMinValue(value);
    }
    disableTextInput();
  }

  function onMaxTextBlur(event) {
    const value = Number.parseFloat(event.currentTarget.value);
    if (!Number.isNaN(value)) {
      updateMaxValue(value);
    }
    disableTextInput();
  }

  function updateSliderScale() {
    // Prevent setting exponent to zero, as it breaks the scale
    const exp = (exponent === 0) ? 1.0 : exponent;

    // If linear scale, we want the resolution to match the step size
    if (exp === 1.0) {
      let nSteps = Math.ceil((max - min) / step);
      if (!Number.isFinite(nSteps)) {
        nSteps = 1000;
      }
      sliderResolution = nSteps;
    }

    // The slider is logarithmic, but the scaling of the value increases exponentially
    return Scale.scalePow()
      .exponent(exp)
      .domain([0, sliderResolution]) // slider pos
      .range([min, max]); // allowed values
  }

  function valueToSliderPos(value) {
    return scale.invert(value);
  }

  function valueFromSliderPos(sliderValue) {
    const scaledValue = scale(sliderValue);
    // If almost max, return max, as rounding will prevent this if the step size
    // is not well chosen
    if (scaledValue > 0.999 * max) {
      return max;
    }
    return roundValueToStepSize(scaledValue, step);
  }

  function updateMinValue(newValue) {
    if (newValue > maxValue) {
      updateMaxValue(newValue);
    }

    setMinValue(newValue);
    const isMinValueOutsideRangeNow = newValue < min || newValue > max;
    setIsMinValueOutsideRange(isMinValueOutsideRangeNow);
    onMinValueChanged(newValue);
  }

  function updateMaxValue(newValue) {
    const isMaxValueOutsideRangeNow = newValue < min || newValue > max;

    if (newValue < minValue) {
      updateMinValue(newValue);
    }
    setMaxValue(newValue);
    setIsMaxValueOutsideRange(isMaxValueOutsideRangeNow);
    onMaxValueChanged(newValue);
  }

  function enableTextInput(event) {
    if (disabled) {
      return;
    }

    // Find out which input was actually clicked
    const { left, right } = event.currentTarget.getBoundingClientRect();
    const { clientX } = event;
    const didClickToLeft = (clientX - left) / (right - left) < 0.5;

    setShowTextInput(true);
    setHoverHint(null);
    setFocusLeftTextInput(didClickToLeft);
    setEnteredInvalidMaxValue(false);
    setEnteredInvalidMinValue(false);
  }

  function disableTextInput() {
    setShowTextInput(false);
    setHoverHint(null);
    setFocusLeftTextInput(null);
  }

  function textTooltipPosition() {
    if (!wrapperRef.current) return { top: '0px', left: '0px' };
    const { top, right } = wrapperRef.current.getBoundingClientRect();
    return { top: `${top}px`, left: `${right}px` };
  }

  function renderTextInput() {
    let doNotInclude = 'onMinValueChanged onMaxValueChanged inputOnly noHoverHint ' +
                       'noTooltip noValue exponent valueMax valueMin label';

    let inputMinClassName = '';
    let inputMaxClassName = '';
    let tootipContent = '';
    let showTooltip = false;

    // If we are already outside the range, sclude the min max properties to the HTML
    // input. But while inside the range we want them to affect what value is possible
    // to set using .e.g the arrow keys
    if (isMinValueOutsideRange || isMaxValueOutsideRange) {
      doNotInclude += ' min max';
      inputMinClassName = isMinValueOutsideRange ? styles.outsideMinMaxRange : '';
      inputMaxClassName = isMaxValueOutsideRange ? styles.outsideMinMaxRange : '';
      showTooltip = true;
      tootipContent = (
        <p>
          {`Value is outside the valid range: `}
          <b>{`[${min}, ${max}].`}</b>
        </p>
      );
    }

    if (enteredInvalidMinValue || enteredInvalidMaxValue) {
      inputMinClassName = enteredInvalidMinValue ? styles.invalidValue : '';
      inputMaxClassName = enteredInvalidMaxValue ? styles.invalidValue : '';
      // TODO: update tooltip content
      showTooltip = true;
      tootipContent = <p>Value is not a number</p>;
    }

    return (
      <div ref={wrapperRef}>
        <Row>
          <Input
            className={inputMinClassName}
            type="number"
            value={minValue}
            label={label || placeholder}
            onBlur={onMinTextBlur}
            onEnter={onMinTextBlur}
            onChange={onMinTextInputChanged}
            autoFocus={focusLeftTextInput}
          />
          <Input
            className={inputMaxClassName}
            type="number"
            value={maxValue}
            label={' '}
            onBlur={onMaxTextBlur}
            onEnter={onMaxTextBlur}
            onChange={onMaxTextInputChanged}
            autoFocus={!focusLeftTextInput}
          />
          {showTooltip && (
            <Tooltip
              className={`${inputMinClassName} ${inputMaxClassName}`}
              fixed
              style={{ ...textTooltipPosition() }}
              placement="right"
            >
              {tootipContent}
            </Tooltip>
          )}
        </Row>
      </div>
    );
  }

  function sliderInput() {
    const doNotInclude = 'wide onMinValueChanged onMaxValueChanged valueMax valueMin ' +
                         'className type min max step exponent inputOnly ' +
                         'label noHoverHint noTooltip';
    // Scale values for exponential slider
    const scaledMinValue = valueToSliderPos(minValue);
    const scaledMaxValue = valueToSliderPos(maxValue);

    // HoverHint is in [0, 1]. Scale to full slider range
    const scaledHoverHintOffset = sliderResolution * hoverHint;
    const tooltipValue = valueFromSliderPos(scaledHoverHintOffset);

    return (
      <div
        className={`${styles.inputGroup} ${wide ? styles.wide : ''}`}
        onDoubleClick={enableTextInput}
        onContextMenu={enableTextInput}
        ref={wrapperRef}
      >
        {!noHoverHint && hoverHint !== null && (
          <div className={styles.hoverHint} style={hoverHintStyle} />
        )}
        { !noTooltip && hoverHint !== null && (
          <Tooltip style={{ left: `${100 * hoverHint}%` }} placement="top">
            { tooltipValue }
          </Tooltip>
        )}
        <div
          className={`${className} ${styles.sliderProgress}`}
          style={{
            '--min': 0, '--max': sliderResolution, '--minValue': scaledMinValue, '--maxValue': scaledMaxValue
          }}
        />
        <input
          {...props}
          className={`${className} ${styles.range} ${styles.left}`}
          id={id.concat(' left')}
          ref={minSliderRef}
          type="range"
          value={scaledMinValue}
          min={0}
          max={sliderResolution}
          step={1}
          onChange={(event) => {
            // make sure we don't pass the max slider
            const sliderValue = Math.min(event.currentTarget.value, scaledMaxValue - step);
            const value = valueFromSliderPos(sliderValue);
            updateMinValue(value);
          }}
          // Put left handle on top on the far right, so it does not get stuck
          // if both handles are at the rightmost edge
          style={{ zIndex: minValue > (max - max / 10) && '5' }}
          onMouseMove={onMouseMove}
          onMouseLeave={onLeave}
          disabled={disabled}
          placeholder={placeholder}
        />
        <input
          {...props}
          className={`${className} ${styles.range} ${styles.right} ${styles.mainSlider}`}
          id={id.concat(' right')}
          ref={maxSliderRef}
          type="range"
          value={scaledMaxValue}
          min={0}
          max={sliderResolution}
          step={1}
          onChange={(event) => {
            // make sure we don't pass the min slider
            const sliderValue = Math.max(event.currentTarget.value, scaledMinValue + step);
            const value = valueFromSliderPos(sliderValue);
            updateMaxValue(value);
          }}
          onMouseMove={onMouseMove}
          onMouseLeave={onLeave}
        />
        <label htmlFor={id} className={`${styles.rangeLabel}`}>
          { label || placeholder }
        </label>
        <span className={styles.leftValue}>
          { roundValueToStepSize(minValue, step) }
        </span>
        <span className={styles.rightValue}>
          { roundValueToStepSize(maxValue, step) }
        </span>
      </div>
    );
  }

  if (inputOnly || showTextInput) {
    return renderTextInput();
  }

  return sliderInput();
}

MinMaxRangeInput.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  exponent: PropTypes.number,
  inputOnly: PropTypes.bool,
  label: PropTypes.node,
  max: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  valueMax: PropTypes.number.isRequired,
  valueMin: PropTypes.number.isRequired,
  noHoverHint: PropTypes.bool,
  noTooltip: PropTypes.bool,
  onMinValueChanged: PropTypes.func,
  onMaxValueChanged: PropTypes.func,
  placeholder: PropTypes.string,
  step: PropTypes.number,
  wide: PropTypes.bool
};

MinMaxRangeInput.defaultProps = {
  className: '',
  disabled: false,
  exponent: 1.0,
  inputOnly: false,
  label: null,
  noHoverHint: false,
  noTooltip: false,
  onMinValueChanged: () => {},
  onMaxValueChanged: () => {},
  placeholder: 'value',
  step: 1,
  wide: true
};

export default MinMaxRangeInput;
