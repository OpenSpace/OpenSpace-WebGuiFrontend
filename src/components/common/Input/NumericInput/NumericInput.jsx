import { clamp } from 'lodash/number';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { excludeKeys } from '../../../../utils/helpers';
import { roundValueToStepSize } from '../../../../utils/rounding';
import Tooltip from '../../Tooltip/Tooltip';
import Input from '../Input/Input';
import styles from './NumericInput.scss';

const Scale = require('d3-scale');

class NumericInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      showTextInput: false,
      id: `numericinput-${Input.nextId}`,
      hoverHint: null,
      isValueOutsideRange: props.value < props.min || props.value > props.max
    };

    this.roundValueToStepSize = this.roundValueToStepSize.bind(this);

    this.updateSliderScale = this.updateSliderScale.bind(this);
    this.valueToSliderPos = this.valueToSliderPos.bind(this);
    this.valueFromSliderPos = this.valueFromSliderPos.bind(this);

    this.onHover = this.onHover.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.onTextBlurOrEnter = this.onTextBlurOrEnter.bind(this);
    this.onTextInputChange = this.onTextInputChange.bind(this);
    this.onSliderChange = this.onSliderChange.bind(this);
    this.enableTextInput = this.enableTextInput.bind(this);
    this.disableTextInput = this.disableTextInput.bind(this);
    this.updateValue = this.updateValue.bind(this);

    this.sliderResolution = 10000;
    this.scale = this.updateSliderScale();
  }

  componentDidUpdate(prevProps, prevState) {
    // Update state value variable when we get new props
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }

    const scaleNeedsUpdate = (prevProps.min !== this.props.min) ||
                             (prevProps.max !== this.props.max) ||
                             (prevProps.step !== this.props.step) ||
                             (prevProps.exponent !== this.props.exponent);

    if (scaleNeedsUpdate) {
      this.scale = this.updateSliderScale();
    }
  }

  roundValueToStepSize(value) {
    return roundValueToStepSize(value, this.props.step);
  }

  updateSliderScale() {
    const {exponent, min, max, step} = this.props;

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

  /**
   * callback for input
   * @param event InputEvent
   */
  onSliderChange(event) {
    const { max, min } = this.props;
    const sliderValue = Number.parseFloat(event.currentTarget.value);
    let newValue = this.valueFromSliderPos(sliderValue);
    // Clamp to min max range (should no be needed, but do anyways just ot be sure)
    newValue = Math.min(Math.max(newValue, min), max);

    this.updateValue(newValue);
  }

  onTextBlurOrEnter(event) {
    const value = Number.parseFloat(event.currentTarget.value);
    if (!isNaN(value)) {
      this.updateValue(value);
    }
    this.disableTextInput();
  }

  onTextInputChange(event) {
    const { max, min } = this.props;

    // Validate the test input
    const value = Number.parseFloat(event.currentTarget.value);
    const isValueOutsideRange =  value < min || value > max;

    if (this.state.isValueOutsideRange !== isValueOutsideRange) {
      this.setState({ isValueOutsideRange });
    }
  }

  updateValue(value) {
    const { max, min } = this.props;
    const isValueOutsideRange =  value < min || value > max;

    // Update state so that input is re-rendered with new content - optimistic ui change
    this.setState({ value, isValueOutsideRange });

    // Send to the onChange (if any)!
    this.props.onValueChanged(value);
  }

  onHover(event) {
    if (this.props.disabled) {
      return;
    }

    // get bounds for input to calc hover percentage
    const { left, right } = event.currentTarget.getBoundingClientRect();
    const { clientX } = event;
    const hoverHint = clamp((clientX - left) / (right - left), 0, 1);
    this.setState({ hoverHint });
  }

  onLeave() {
    this.setState({ hoverHint: null });
  }

  get showTextInput() {
    return this.props.inputOnly || this.state.showTextInput;
  }

  enableTextInput() {
    if (this.props.disabled) {
      return;
    }
    this.setState({ showTextInput: true, hoverHint: null });
  }

  disableTextInput() {
    this.setState({ showTextInput: false, hoverHint: null});
  }

  render() {
    const { value, id, isValueOutsideRange, hoverHint } = this.state;
    const { decimals, min, max, showOutsideRangeHint } = this.props;

    if (this.showTextInput) {
      let excludeProps = 'reverse onValueChanged inputOnly noHoverHint noTooltip noValue exponent showOutsideRangeHint';
      let inputClassName = '';

      // If we are already outside the range, sclude the min max properties to the HTML
      // input. But while inside the range we want them to affect what value is possible
      // to set using .e.g the arrow keys
      if (isValueOutsideRange) {
        excludeProps += ' min max';
        if (showOutsideRangeHint) {
          inputClassName += styles.outsideMinMaxRange;
        }
      }

      return (
        <div className={`${styles.inputGroup}`}>
          {showOutsideRangeHint && isValueOutsideRange &&
            <Tooltip style={{ left: `50%` }} placement={'top'}>
              { `Value is outside the property's min/max range: \n [${min}, ${max}].` }
              { "Might lead to undesired behavior" }
            </Tooltip>
          }
          <Input
            {...excludeKeys(this.props, excludeProps)}
            className={inputClassName}
            type="number"
            value={value}
            onBlur={this.onTextBlurOrEnter}
            onChange={this.onTextInputChange}
            onEnter={this.onTextBlurOrEnter}
            autoFocus
          />
        </div>
      );
    }

    const { placeholder, className, label, wide, reverse, noValue } = this.props;
    const doNotInclude = 'wide reverse onValueChanged value className type min max step exponent ' +
                         'inputOnly label noHoverHint noTooltip noValue showOutsideRangeHint';
    const inheritedProps = excludeKeys(this.props, doNotInclude);
    const hoverHintOffset = reverse ? 1 - hoverHint : hoverHint;

    const sliderValue = this.valueToSliderPos(value);
    // HoverHintOffset is in [0, 1]. Scale to full slider range
    const scaledHoverHintOffset = this.sliderResolution * hoverHintOffset;
    const tooltipValue = this.valueFromSliderPos(scaledHoverHintOffset);
    const displayValue = decimals ? value.toFixed(decimals) : value;
    return (
      <div
        className={`${styles.inputGroup} ${wide ? styles.wide : ''} ${reverse ? styles.reverse : ''}`}
        onDoubleClick={this.enableTextInput}
        onContextMenu={this.enableTextInput}
      >
        { !this.props.noHoverHint && hoverHint !== null && (
          <div className={styles.hoverHint} style={{ width: `${100 * hoverHintOffset}%` }} />
        )}
        { !this.props.noTooltip && hoverHint !== null && (
          <Tooltip style={{ left: `${100 * hoverHint}%` }} placement={'top'}>
            { tooltipValue }
          </Tooltip>
        )}
        <input
          {...inheritedProps}
          id={id}
          type="range"
          value={"test"}
          min={0}
          max={this.sliderResolution}
          step={1}
          className={`${className} ${styles.range}`}
          style={{ '--min': 0, '--max': this.sliderResolution, '--value': sliderValue, direction: reverse ? "rtl" : "ltr" }}
          onClickCapture={(event) => event.stopPropagation()}
          onChange={this.onSliderChange}
          onMouseMove={this.onHover}
          onMouseLeave={this.onLeave}
        />
        <label htmlFor={id} className={`${styles.rangeLabel}`}>
          { label || placeholder }
        </label>
        <span className={styles.value}>
          {noValue ? "" : displayValue}
        </span>
      </div>
    );
  }
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

NumericInput.defaultProps = {
  className: '',
  disabled: false,
  exponent: 1.0,
  inputOnly: false,
  label: null,
  max: 100,
  min: 0,
  reverse: false,
  noHoverHint: false,
  noTooltip: false,
  noValue: false,
  onValueChanged: () => {},
  showOutsideRangeHint: true,
  step: 1,
  value: 0,
  wide: true,
  decimals: undefined
};

export default NumericInput;
