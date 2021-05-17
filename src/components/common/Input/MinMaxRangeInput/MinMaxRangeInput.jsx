import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { excludeKeys } from '../../../../utils/helpers';
import styles from './MinMaxRangeInput.scss';
import Input from '../Input/Input';
import Tooltip from '../../Tooltip/Tooltip';
import { round10 } from '../../../../utils/rounding';
import { clamp } from 'lodash/number';
import Row from '../../Row/Row';

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
      focusLeftTextInput: null
    };

    this.setRef = this.setRef.bind(this);
    
    this.updateSliderScale = this.updateSliderScale.bind(this);
    this.scaleValueToSlider = this.scaleValueToSlider.bind(this);
    this.valueFromSliderPos = this.valueFromSliderPos.bind(this);

    this.roundValueToStepSize = this.roundValueToStepSize.bind(this);

    this.updateMinValue = this.updateMinValue.bind(this);
    this.updateMaxValue = this.updateMaxValue.bind(this);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onLeave = this.onLeave.bind(this);

    this.enableTextInput = this.enableTextInput.bind(this);
    this.disableTextInput = this.disableTextInput.bind(this);
    this.onMinTextBlur = this.onMinTextBlur.bind(this);
    this.onMaxTextBlur = this.onMaxTextBlur.bind(this);
    this.renderTextInput = this.renderTextInput.bind(this);

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
                             (prevProps.exponent !== this.props.exponent);

    if (scaleNeedsUpdate) {
      this.scale = this.updateSliderScale();
    }
  }

  setRef(what) {
    return (element) => { this[what] = element; };
  }

  updateSliderScale() {
    const {exponent, min, max} = this.props;

    // Prevent setting exponent to zero, as it breaks the scale
    const exp = (exponent == 0) ? 1.0 : exponent;

    // The slider is logarithmic, but the scaling of the value increases exponentially
    return Scale.scalePow()
            .exponent(exp)
            .domain([min, max])
            .range([min, max]);
  }

  scaleValueToSlider(value) {
    return this.scale.invert(value);
  }

  valueFromSliderPos(sliderValue) {
    return this.roundValueToStepSize(this.scale(sliderValue));
  }

  roundValueToStepSize(value) {
    // TODO: this should be able to handle any step size.
    // Now it only deals with exponents of 10
    return round10(value, Math.log10(this.props.step));
  }

  updateMinValue(newValue) {
    this.setState({ minValue: newValue });
    this.props.onMinValueChanged(newValue);
  }

  updateMaxValue(newValue) {
    this.setState({ maxValue: newValue });
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
    const { min, max } = this.props;

    // We have to map the value to the slider scale, to get the correct position
    // (note that we don't do this for min and max, as they are the same for any scale)
    const scaledMinValue = this.scaleValueToSlider(minValue);
    const scaledMaxValue = this.scaleValueToSlider(maxValue);

    const normalizedMinValue = (scaledMinValue - min) / (max - min);
    const normalizedMaxValue = (scaledMaxValue - min) / (max - min);

    // Style for hint bar
    let styleLeft = 0;
    let styleWidth = 0;

    // TODO: make the hint account for when we have the mouse button down

    const onTop = '4';
    const onBottom = '3';

    const putRightSliderOnTop = () => {
      this.maxSlider.style.zIndex = onTop;
      this.minSlider.style.zIndex = onBottom;

      styleLeft = normalizedMinValue;
      styleWidth = hoverHint - normalizedMinValue;
    }

    const putLeftSliderOnTop = () => {
      this.minSlider.style.zIndex = onTop;
      this.maxSlider.style.zIndex = onBottom;

      styleLeft = hoverHint;
      styleWidth = normalizedMaxValue - hoverHint;
    }

    if (hoverHint < normalizedMinValue) { // mouse < minValue
      putLeftSliderOnTop();
    }
    else if (hoverHint < normalizedMaxValue) { // minValue < mouse < maxValue
      // Pick the closest handle
      const leftDistance = hoverHint - normalizedMinValue;
      const rightDistance = normalizedMaxValue - hoverHint;

      if (leftDistance < rightDistance) { // closer to the left
        putLeftSliderOnTop();
      }
      else { // closer to the right
        putRightSliderOnTop();
      }
    }
    else { // mouse > maxValue
      putRightSliderOnTop();
    }

    const hoverHintStyle = {
      width: `${100 * styleWidth}%`,
      left: `${100 * styleLeft}%`
    }

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

    this.setState({ showTextInput: true, hoverHint: null, focusLeftTextInput: didClickToLeft });
  }

  disableTextInput() {
    this.setState({ showTextInput: false, hoverHint: null, focusLeftTextInput: null});
  }

  onMinTextBlur(event) {
    const value = Number.parseFloat(event.currentTarget.value);
    this.updateMinValue(value);
    this.disableTextInput();
  }

  onMaxTextBlur(event) {
    const value = Number.parseFloat(event.currentTarget.value);
    this.updateMaxValue(value);
    this.disableTextInput();
  }

  renderTextInput() {
    const { minValue, maxValue, focusLeftTextInput } = this.state;
    const { placeholder, label } = this.props;

    const doNotInclude = 'onMinValueChanged onMaxValueChanged inputOnly noHoverHint ' +
                         'noTooltip noValue exponent valueMax valueMin label'
    const inheritedProps = excludeKeys(this.props, doNotInclude);

    return (
      <Row>
        <Input
          {...inheritedProps}
          type="number"
          value={minValue}
          label={label || placeholder}
          onBlur={this.onMinTextBlur}
          onEnter={this.onMinTextBlur}
          autoFocus={focusLeftTextInput}
        />
        <Input
          {...inheritedProps}
          type="number"
          value={maxValue}
          label={' '}
          onBlur={this.onMaxTextBlur}
          onEnter={this.onMaxTextBlur}
          autoFocus={!focusLeftTextInput}
        />
    </Row>
    );
  }

  render() {
    const { minValue, maxValue, id, hoverHint, hoverHintStyle } = this.state;

    const { placeholder, className, label, wide, min, max, step } = this.props;
    const doNotInclude = 'wide onMinValueChanged onMaxValueChanged valueMax valueMin ' +
                         'className type min max step exponent ' +
                         'label noHoverHint noTooltip';
    const inheritedProps = excludeKeys(this.props, doNotInclude);

    if (this.showTextInput) {
      return this.renderTextInput();
    }

    // Scale values for exponential slider
    const scaledMinValue = this.scaleValueToSlider(minValue);
    const scaledMaxValue = this.scaleValueToSlider(maxValue);

    // HoverHint is in [0, 1]. Scale to full range
    const scaledHoverHintOffset = (max - min) * hoverHint + min;

    const tooltipValue = this.valueFromSliderPos(scaledHoverHintOffset);

    return (
      <div
        className={`${styles.inputGroup} ${wide ? styles.wide : ''}`}
        onDoubleClick={this.enableTextInput}
        onContextMenu={this.enableTextInput}
      >
        {!this.props.noHoverHint && hoverHint !== null && (
          <div className={styles.hoverHint} style={hoverHintStyle} />
        )} 
        { !this.props.noTooltip && hoverHint !== null && (
          <Tooltip style={{ left: `${100 * hoverHint}%` }}>
            { tooltipValue }
          </Tooltip>
        )}
        <div
          className={`${className} ${styles.sliderProgress}`}
          ref={this.setRef('slider')}
          style={{ '--min': min, '--max': max, '--minValue': scaledMinValue, '--maxValue': scaledMaxValue}}
        />
        <input
          {...inheritedProps}
          className={`${className} ${styles.range} ${styles.left}`}
          id={id.concat(" left")}
          ref={this.setRef('minSlider')}
          type="range"
          value={scaledMinValue}
          min={min}
          max={max}
          step={step}
          onChange={event => {
            // make sure we don't pass the max slider
            const sliderValue = Math.min(event.currentTarget.value, scaledMaxValue - step);
            const value = this.valueFromSliderPos(sliderValue);
            this.updateMinValue(value);
          }}
          // Put left handle on top on the far right, so it does not get stuck
          // if both handles are at the rightmost edge
          style={{ zIndex: minValue > (max - max/10) && "5" }}
          onMouseMove={this.onMouseMove}
          onMouseLeave={this.onLeave}
        />
        <input
          {...inheritedProps}
          className={`${className} ${styles.range} ${styles.right} ${styles.mainSlider}`}
          id={id.concat(" right")}
          ref={this.setRef('maxSlider')}
          type="range"
          value={scaledMaxValue}
          min={min}
          max={max}
          step={step}
          onChange={event => {
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
  wide: PropTypes.bool,
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
  wide: true,
};

export default MinMaxRangeInput;
