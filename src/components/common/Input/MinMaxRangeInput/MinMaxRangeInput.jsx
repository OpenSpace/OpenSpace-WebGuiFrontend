import { clamp } from 'lodash/number';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { excludeKeys } from '../../../../utils/helpers';
import { roundValueToStepSize } from '../../../../utils/rounding';
import Row from '../../Row/Row';
import Tooltip from '../../Tooltip/Tooltip';
import Input from '../Input/Input';
import styles from './MinMaxRangeInput.scss';

const Scale = require('d3-scale');

class MinMaxRangeInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      minValue: props.valueMin,
      maxValue: props.valueMax,
      id: `minmaxrangeinput-${Input.nextId}`,
      hoverHint: null,
      hoverHintStyle: {},
      showTextInput: false,
      focusLeftTextInput: null,
      isMinValueOutsideRange: props.valueMin < props.min || props.valueMin > props.max,
      isMaxValueOutsideRange: props.valueMax < props.min || props.valueMax > props.max,
      enteredInvalidMinValue: false,
      enteredInvalidMaxValue: false
    };

    this.setRef = this.setRef.bind(this);

    this.updateSliderScale = this.updateSliderScale.bind(this);
    this.valueToSliderPos = this.valueToSliderPos.bind(this);
    this.valueFromSliderPos = this.valueFromSliderPos.bind(this);

    this.roundValueToStepSize = this.roundValueToStepSize.bind(this);

    this.onMinTextInputChanged = this.onMinTextInputChanged.bind(this);
    this.onMaxTextInputChanged = this.onMaxTextInputChanged.bind(this);
    this.updateMinValue = this.updateMinValue.bind(this);
    this.updateMaxValue = this.updateMaxValue.bind(this);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onLeave = this.onLeave.bind(this);

    this.enableTextInput = this.enableTextInput.bind(this);
    this.disableTextInput = this.disableTextInput.bind(this);
    this.onMinTextBlur = this.onMinTextBlur.bind(this);
    this.onMaxTextBlur = this.onMaxTextBlur.bind(this);
    this.textTooltipPosition = this.textTooltipPosition.bind(this);
    this.renderTextInput = this.renderTextInput.bind(this);

    this.sliderResolution = 10000;
    this.scale = this.updateSliderScale();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.valueMin !== this.props.valueMin) {
      this.setState({ minValue: this.props.valueMin });
    }

    if (prevProps.valueMax !== this.props.valueMax) {
      this.setState({ maxValue: this.props.valueMax });
    }

    const scaleNeedsUpdate = (prevProps.min !== this.props.min) ||
                             (prevProps.max !== this.props.max) ||
                             (prevProps.step !== this.props.step) ||
                             (prevProps.exponent !== this.props.exponent);

    if (scaleNeedsUpdate) {
      this.scale = this.updateSliderScale();
    }
  }

  setRef(what) {
    return (element) => { this[what] = element; };
  }

  updateSliderScale() {
    const {
      exponent, min, max, step
    } = this.props;

    // Prevent setting exponent to zero, as it breaks the scale
    const exp = (exponent == 0) ? 1.0 : exponent;

    // If linear scale, we want the resolution to match the step size
    if (exp == 1.0) {
      let nSteps = Math.ceil((max - min) / step);
      if (!isFinite(nSteps)) {
        nSteps = 1000;
      }
      this.sliderResolution = nSteps;
    }

    // The slider is logarithmic, but the scaling of the value increases exponentially
    return Scale.scalePow()
      .exponent(exp)
      .domain([0, this.sliderResolution]) // slider pos
      .range([min, max]); // allowed values
  }

  valueToSliderPos(value) {
    return this.scale.invert(value);
  }

  valueFromSliderPos(sliderValue) {
    const scaledValue = this.scale(sliderValue);
    // If almost max, return max, as rounding will prevent this if the step size
    // is not well chosen
    if (scaledValue > 0.999 * this.props.max) {
      return this.props.max;
    }
    return this.roundValueToStepSize(scaledValue);
  }

  roundValueToStepSize(value) {
    return roundValueToStepSize(value, this.props.step);
  }

  onMinTextInputChanged(event) {
    const { max, min } = this.props;

    // Validate the test input
    const value = Number.parseFloat(event.currentTarget.value);
    const isMinValueOutsideRange = value < min || value > max;
    const enteredNanValue = isNaN(value) || !isFinite(value);

    if (this.state.isMinValueOutsideRange !== isMinValueOutsideRange) {
      this.setState({ isMinValueOutsideRange });
    }

    if (this.state.enteredInvalidMinValue !== enteredNanValue) {
      this.setState({ enteredInvalidMinValue: enteredNanValue });
    }
  }

  onMaxTextInputChanged(event) {
    const { max, min } = this.props;

    // Validate the test input
    const value = Number.parseFloat(event.currentTarget.value);
    const isMaxValueOutsideRange = value < min || value > max;
    const enteredNanValue = isNaN(value) || !isFinite(value);

    if (this.state.isMaxValueOutsideRange !== isMaxValueOutsideRange) {
      this.setState({ isMaxValueOutsideRange });
    }

    if (this.state.enteredInvalidMaxValue !== enteredNanValue) {
      this.setState({ enteredInvalidMaxValue: enteredNanValue });
    }
  }

  updateMinValue(newValue) {
    const { max, min } = this.props;
    const isMinValueOutsideRange = newValue < min || newValue > max;

    if (newValue > this.state.maxValue) {
      this.updateMaxValue(newValue);
    }

    this.setState({ minValue: newValue, isMinValueOutsideRange });
    this.props.onMinValueChanged(newValue);
  }

  updateMaxValue(newValue) {
    const { max, min } = this.props;
    const isMaxValueOutsideRange = newValue < min || newValue > max;

    if (newValue < this.state.minValue) {
      this.updateMinValue(newValue);
    }

    this.setState({ maxValue: newValue, isMaxValueOutsideRange });
    this.props.onMaxValueChanged(newValue);
  }

  onMouseMove(event) {
    if (this.props.disabled) {
      return;
    }

    // Get bounds for input to compute hover percentage
    const { left, right } = event.currentTarget.getBoundingClientRect();
    const { clientX } = event;
    const hoverHint = clamp((clientX - left) / (right - left), 0, 1);
    this.setState({ hoverHint });

    // Handle other things that depend on mouse position, such as which slider
    // should be on top and the styling of the hint bar

    const { minValue, maxValue } = this.state;

    // We have to map the value to the slider scale, to get the correct position
    const scaledMinValue = this.valueToSliderPos(minValue);
    const scaledMaxValue = this.valueToSliderPos(maxValue);
    const normalizedMinValue = scaledMinValue / this.sliderResolution;
    const normalizedMaxValue = scaledMaxValue / this.sliderResolution;

    // Style for hint bar
    let styleLeft = 0;
    let styleWidth = 0;

    // @TODO (emmbr, 2021-05-25): potentially make the hint account for when the
    // mouse is down, to avoid showing faulty hints when dragging slider handle

    const onTop = '4';
    const onBottom = '3';

    const putRightSliderOnTop = () => {
      this.maxSlider.style.zIndex = onTop;
      this.minSlider.style.zIndex = onBottom;

      styleLeft = normalizedMinValue;
      styleWidth = hoverHint - normalizedMinValue;
    };

    const putLeftSliderOnTop = () => {
      this.minSlider.style.zIndex = onTop;
      this.maxSlider.style.zIndex = onBottom;

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

    const hoverHintStyle = {
      width: `${100 * styleWidth}%`,
      left: `${100 * styleLeft}%`
    };

    this.setState({ hoverHintStyle });
  }

  onLeave() {
    this.setState({ hoverHint: null });
  }

  get showTextInput() {
    return this.props.inputOnly || this.state.showTextInput;
  }

  enableTextInput(event) {
    if (this.props.disabled) {
      return;
    }

    // Find out which input was actually clicked
    const { left, right } = event.currentTarget.getBoundingClientRect();
    const { clientX } = event;
    const didClickToLeft = (clientX - left) / (right - left) < 0.5;

    this.setState({
      showTextInput: true,
      hoverHint: null,
      focusLeftTextInput: didClickToLeft,
      enteredInvalidMinValue: false,
      enteredInvalidMaxValue: false
    });
  }

  disableTextInput() {
    this.setState({ showTextInput: false, hoverHint: null, focusLeftTextInput: null });
  }

  onMinTextBlur(event) {
    const value = Number.parseFloat(event.currentTarget.value);
    if (!isNaN(value)) {
      this.updateMinValue(value);
    }
    this.disableTextInput();
  }

  onMaxTextBlur(event) {
    const value = Number.parseFloat(event.currentTarget.value);
    if (!isNaN(value)) {
      this.updateMaxValue(value);
    }
    this.disableTextInput();
  }

  textTooltipPosition() {
    if (!this.wrapperRef) return { top: '0px', left: '0px' };
    const { top, right } = this.wrapperRef.getBoundingClientRect();
    return { top: `${top}px`, left: `${right}px` };
  }

  renderTextInput() {
    const {
      minValue, maxValue, focusLeftTextInput, isMinValueOutsideRange,
      isMaxValueOutsideRange, enteredInvalidMinValue, enteredInvalidMaxValue
    } = this.state;
    const {
      placeholder, label, min, max
    } = this.props;

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

    const inheritedProps = excludeKeys(this.props, doNotInclude);

    return (
      <div ref={this.setRef('wrapperRef')}>
        <Row>
          <Input
            {...inheritedProps}
            className={inputMinClassName}
            type="number"
            value={minValue}
            label={label || placeholder}
            onBlur={this.onMinTextBlur}
            onEnter={this.onMinTextBlur}
            onChange={this.onMinTextInputChanged}
            autoFocus={focusLeftTextInput}
          />
          <Input
            {...inheritedProps}
            className={inputMaxClassName}
            type="number"
            value={maxValue}
            label={' '}
            onBlur={this.onMaxTextBlur}
            onEnter={this.onMaxTextBlur}
            onChange={this.onMaxTextInputChanged}
            autoFocus={!focusLeftTextInput}
          />
          {showTooltip && (
            <Tooltip
              className={`${inputMinClassName} ${inputMaxClassName}`}
              fixed
              style={{ ...this.textTooltipPosition() }}
              placement="right"
            >
              {tootipContent}
            </Tooltip>
          )}
        </Row>
      </div>
    );
  }

  render() {
    const {
      minValue, maxValue, id, hoverHint, hoverHintStyle
    } = this.state;

    const {
      placeholder, className, label, wide, min, max, step
    } = this.props;
    const doNotInclude = 'wide onMinValueChanged onMaxValueChanged valueMax valueMin ' +
                         'className type min max step exponent ' +
                         'label noHoverHint noTooltip';
    const inheritedProps = excludeKeys(this.props, doNotInclude);

    if (this.showTextInput) {
      return this.renderTextInput();
    }

    // Scale values for exponential slider
    const scaledMinValue = this.valueToSliderPos(minValue);
    const scaledMaxValue = this.valueToSliderPos(maxValue);

    // HoverHint is in [0, 1]. Scale to full slider range
    const scaledHoverHintOffset = this.sliderResolution * hoverHint;
    const tooltipValue = this.valueFromSliderPos(scaledHoverHintOffset);

    return (
      <div
        className={`${styles.inputGroup} ${wide ? styles.wide : ''}`}
        onDoubleClick={this.enableTextInput}
        onContextMenu={this.enableTextInput}
        ref={this.setRef('wrapperRef')}
      >
        {!this.props.noHoverHint && hoverHint !== null && (
          <div className={styles.hoverHint} style={hoverHintStyle} />
        )}
        { !this.props.noTooltip && hoverHint !== null && (
          <Tooltip style={{ left: `${100 * hoverHint}%` }} placement="top">
            { tooltipValue }
          </Tooltip>
        )}
        <div
          className={`${className} ${styles.sliderProgress}`}
          ref={this.setRef('slider')}
          style={{
            '--min': 0, '--max': this.sliderResolution, '--minValue': scaledMinValue, '--maxValue': scaledMaxValue
          }}
        />
        <input
          {...inheritedProps}
          className={`${className} ${styles.range} ${styles.left}`}
          id={id.concat(' left')}
          ref={this.setRef('minSlider')}
          type="range"
          value={scaledMinValue}
          min={0}
          max={this.sliderResolution}
          step={1}
          onChange={(event) => {
            // make sure we don't pass the max slider
            const sliderValue = Math.min(event.currentTarget.value, scaledMaxValue - step);
            const value = this.valueFromSliderPos(sliderValue);
            this.updateMinValue(value);
          }}
          // Put left handle on top on the far right, so it does not get stuck
          // if both handles are at the rightmost edge
          style={{ zIndex: minValue > (max - max / 10) && '5' }}
          onMouseMove={this.onMouseMove}
          onMouseLeave={this.onLeave}
        />
        <input
          {...inheritedProps}
          className={`${className} ${styles.range} ${styles.right} ${styles.mainSlider}`}
          id={id.concat(' right')}
          ref={this.setRef('maxSlider')}
          type="range"
          value={scaledMaxValue}
          min={0}
          max={this.sliderResolution}
          step={1}
          onChange={(event) => {
            // make sure we don't pass the min slider
            const sliderValue = Math.max(event.currentTarget.value, scaledMinValue + step);
            const value = this.valueFromSliderPos(sliderValue);
            this.updateMaxValue(value);
          }}
          onMouseMove={this.onMouseMove}
          onMouseLeave={this.onLeave}
        />
        <label htmlFor={id} className={`${styles.rangeLabel}`}>
          { label || placeholder }
        </label>
        <span className={styles.leftValue}>
          { this.roundValueToStepSize(minValue) }
        </span>
        <span className={styles.rightValue}>
          { this.roundValueToStepSize(maxValue) }
        </span>
      </div>
    );
  }
}

MinMaxRangeInput.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  exponent: PropTypes.number,
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
