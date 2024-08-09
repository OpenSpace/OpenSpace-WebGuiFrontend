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
  className = '',
  disabled = false,
  exponent = 1.0,
  inputOnly = false,
  label = null,
  max,
  min,
  noHoverHint = false,
  noTooltip = false,
  onMaxValueChanged = () => {},
  onMinValueChanged = () => {},
  placeholder = 'value',
  step = 1,
  valueMax,
  valueMin,
  wide = true,
  ...props
}) {
  const [minValue, setMinValue] = React.useState(valueMin);
  const [maxValue, setMaxValue] = React.useState(valueMax);
  const [hoverHint, setHoverHint] = React.useState(null);
  const [hoverHintStyle, setHoverHintStyle] = React.useState({});
  const [showTextInput, setShowTextInput] = React.useState(false);
  const [focusLeftTextInput, setFocusLeftTextInput] = React.useState(null);
  const [isMinValueOutsideRange, setIsMinValueOutsideRange] = React.useState(
    valueMin < min || valueMin > max
  );
  const [isMaxValueOutsideRange, setIsMaxValueOutsideRange] = React.useState(
    valueMax < min || valueMax > max
  );
  const [enteredInvalidMinValue, setEnteredInvalidMinValue] = React.useState(false);
  const [enteredInvalidMaxValue, setEnteredInvalidMaxValue] = React.useState(false);

  const id = React.useRef(`minmaxrangeinput-${Input.nextId}`);
  const wrapperRef = React.useRef(null);
  const minSliderRef = React.useRef(null);
  const maxSliderRef = React.useRef(null);
  const scale = React.useRef(null);
  const sliderResolution = React.useRef(10000);

  React.useEffect(() => {
    setMinValue(valueMin);
  }, [valueMin]);

  React.useEffect(() => {
    setMaxValue(valueMax);
  }, [valueMax]);

  // The useMemo hook is called before first render.
  // Used to initialize
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

  function valueToSliderPos(value) {
    return scale.current.invert(value);
  }

  function updateMinValue(newValue) {
    if (newValue > maxValue) {
      // eslint-disable-next-line no-use-before-define
      updateMaxValue(newValue);
    }

    const isMinValueOutsideRangeNow = newValue < min || newValue > max;
    setIsMinValueOutsideRange(isMinValueOutsideRangeNow);
    setMinValue(newValue);
    onMinValueChanged(newValue);
  }

  function updateMaxValue(newValue) {
    if (newValue < minValue) {
      updateMinValue(newValue);
    }
    const isMaxValueOutsideRangeNow = newValue < min || newValue > max;
    setIsMaxValueOutsideRange(isMaxValueOutsideRangeNow);
    setMaxValue(newValue);
    onMaxValueChanged(newValue);
  }

  function onMinTextInputChanged(event) {
    // Validate the test input
    const value = Number.parseFloat(event.currentTarget.value);
    const isMinValueOutsideRangeNow = value < min || value > max;
    const enteredNanValueNow = Number.isNaN(value) || !Number.isFinite(value);

    if (isMinValueOutsideRange !== isMinValueOutsideRangeNow) {
      setIsMinValueOutsideRange(isMinValueOutsideRangeNow);
    }

    if (enteredInvalidMinValue !== enteredNanValueNow) {
      setEnteredInvalidMinValue(enteredNanValueNow);
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

  function disableTextInput() {
    setShowTextInput(false);
    setHoverHint(null);
    setFocusLeftTextInput(null);
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
    const normalizedMinValue = scaledMinValue / sliderResolution.current;
    const normalizedMaxValue = scaledMaxValue / sliderResolution.current;

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
      styleWidth = hoverHintNow - normalizedMinValue;
    };

    const putLeftSliderOnTop = () => {
      minSliderRef.current.style.zIndex = onTop;
      maxSliderRef.current.style.zIndex = onBottom;

      styleLeft = hoverHintNow;
      styleWidth = normalizedMaxValue - hoverHintNow;
    };

    if (hoverHintNow < normalizedMinValue) { // mouse < minValue
      putLeftSliderOnTop();
    } else if (hoverHintNow < normalizedMaxValue) { // minValue < mouse < maxValue
      // Pick the closest handle
      const leftDistance = hoverHintNow - normalizedMinValue;
      const rightDistance = normalizedMaxValue - hoverHintNow;

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

  function valueFromSliderPos(sliderValue) {
    const scaledValue = scale.current(sliderValue);
    // If almost max, return max, as rounding will prevent this if the step size
    // is not well chosen
    if (scaledValue > 0.999 * max) {
      return max;
    }
    return roundValueToStepSize(scaledValue, step);
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

  function textTooltipPosition() {
    if (!wrapperRef.current) return { top: '0px', left: '0px' };
    const { top, right } = wrapperRef.current.getBoundingClientRect();
    return { top: `${top}px`, left: `${right}px` };
  }

  function renderTextInput() {
    const valueIsInvalid = enteredInvalidMinValue || enteredInvalidMaxValue;
    const valueIsOutsideRange = isMinValueOutsideRange || isMaxValueOutsideRange;
    const valueIsBad = valueIsInvalid || valueIsOutsideRange;

    // If we are already outside the range, sclude the min max properties to the HTML
    // input. But while inside the range we want them to affect what value is possible
    // to set using .e.g the arrow keys
    const currentMin = valueIsOutsideRange ? null : min;
    const currentMax = valueIsOutsideRange ? null : max;

    // Styling
    const isMinBad = isMinValueOutsideRange || enteredInvalidMinValue;
    const isMaxBad = isMaxValueOutsideRange || enteredInvalidMaxValue;
    const stylesInvalid = valueIsInvalid ? styles.invalidValue : '';
    const stylesOutsideRange = valueIsOutsideRange ? styles.outsideMinMaxRange : '';
    const styling = `${stylesInvalid} ${stylesOutsideRange}`;

    return (
      <div ref={wrapperRef}>
        <Row>
          <Input
            {...props}
            className={`${isMinBad && styling}`}
            type="number"
            value={minValue}
            label={label || placeholder}
            onBlur={onMinTextBlur}
            onEnter={onMinTextBlur}
            onChange={onMinTextInputChanged}
            autoFocus={focusLeftTextInput}
            min={currentMin}
            max={currentMax}
            placeholder={placeholder}
          />
          <Input
            {...props}
            className={`${isMaxBad && styling}`}
            type="number"
            value={maxValue}
            label={' '}
            onBlur={onMaxTextBlur}
            onEnter={onMaxTextBlur}
            onChange={onMaxTextInputChanged}
            autoFocus={!focusLeftTextInput}
            min={currentMin}
            max={currentMax}
            placeholder={placeholder}
          />
          {valueIsBad && (
            <Tooltip
              className={styling}
              fixed
              style={{ ...textTooltipPosition() }}
              placement="right"
            >
              {valueIsOutsideRange && (
                <p>
                  {`Value is outside the valid range: `}
                  <b>{`[${min}, ${max}].`}</b>
                </p>
              )}
              {valueIsInvalid && (
                <p>Value is not a number</p>
              )}
            </Tooltip>
          )}
        </Row>
      </div>
    );
  }

  function sliderInput() {
    // Scale values for exponential slider
    const scaledMinValue = valueToSliderPos(minValue);
    const scaledMaxValue = valueToSliderPos(maxValue);

    // HoverHint is in [0, 1]. Scale to full slider range
    const scaledHoverHintOffset = sliderResolution.current * hoverHint;
    const tooltipValue = valueFromSliderPos(scaledHoverHintOffset);

    return (
      <div
        className={`${styles.inputGroup} ${wide ? styles.wide : ''}`}
        onDoubleClick={enableTextInput}
        onContextMenu={enableTextInput}
        ref={wrapperRef}
      >
        { !noHoverHint && hoverHint !== null && (
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
            '--min': 0, '--max': sliderResolution.current, '--minValue': scaledMinValue, '--maxValue': scaledMaxValue
          }}
        />
        <input
          {...props}
          className={`${className} ${styles.range} ${styles.left}`}
          id={id.current.concat(' left')}
          ref={minSliderRef}
          type="range"
          value={scaledMinValue}
          min={0}
          max={sliderResolution.current}
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
          id={id.current.concat(' right')}
          ref={maxSliderRef}
          type="range"
          value={scaledMaxValue}
          min={0}
          max={sliderResolution.current}
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
        <label htmlFor={id.current} className={`${styles.rangeLabel}`}>
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
  noHoverHint: PropTypes.bool,
  noTooltip: PropTypes.bool,
  onMaxValueChanged: PropTypes.func,
  onMinValueChanged: PropTypes.func,
  placeholder: PropTypes.string,
  step: PropTypes.number,
  valueMax: PropTypes.number.isRequired,
  valueMin: PropTypes.number.isRequired,
  wide: PropTypes.bool
};

export default MinMaxRangeInput;
