import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { excludeKeys } from '../../../../utils/helpers';
import styles from './NumericInput.scss';
import Input from '../Input/Input';
import Tooltip from '../../Tooltip/Tooltip';
import { round10 } from '../../../../utils/rounding';
import { clamp } from 'lodash/number';

const Scale = require('d3-scale');

class NumericInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      showTextInput: false,
      id: `numericinput-${Input.nextId}`,
      hoverHint: null,
    };

    // The slider is logarithmic, but the scaling of the value increases exponentially.
    // The exponent of the scaling is set based on the max value, to give a reasonable scale
    // for ranges of different sizes
    const exp = (Math.abs(props.max) > 1.0) ? Math.log10(props.max) : 1.0;
    const scale = props.logarithmicScale ? Scale.scalePow().exponent(exp) : Scale.scaleLinear();
    this.scale = scale.domain([0, 100]).range([props.min, props.max]);

    this.sliderMin = scale.domain()[0];
    this.sliderMax = scale.domain()[1];

    this.onHover = this.onHover.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.onTextBlur = this.onTextBlur.bind(this);
    this.onSliderChange = this.onSliderChange.bind(this);
    this.enableTextInput = this.enableTextInput.bind(this);
    this.disableTextInput = this.disableTextInput.bind(this);
    this.updateValue = this.updateValue.bind(this);
  }

  componentWillReceiveProps({ value }) {
    this.setState({ value });
  }

  /**
   * callback for input
   * @param event InputEvent
   */
  onSliderChange(event) {
    const sliderValue = Number.parseFloat(event.currentTarget.value);
    const newValue = Number.parseFloat(this.scale(sliderValue).toFixed(2));
    this.updateValue(newValue);
  }

  onTextBlur(event) {
    const value = Number.parseFloat(event.currentTarget.value);
    this.updateValue(value);
    this.disableTextInput();
  }

  updateValue(value) {
    const { max, min } = this.props;

    if (value > max || value < min) return;

    // update state so that input is re-rendered with new content - optimistic ui change
    this.setState({ value });

    // send to the onChange (if any)!
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

  enableTextInput(event) {
    if (this.props.disableInput) {
      return;
    }
    this.setState({ showTextInput: true, hoverHint: null });
  }

  disableTextInput() {
    this.setState({ showTextInput: false, hoverHint: null});
  }

  render() {
    const { value, id, hoverHint } = this.state;

    if (this.showTextInput) {
      return (
        <Input
          {...excludeKeys(this.props, 'reverse onValueChanged disableInput inputOnly noHoverHint noTooltip logarithmicScale')}
          type="number"
          value={value}
          onBlur={this.onTextBlur}
          onEnter={this.onTextBlur}
          autoFocus
        />
      );
    }

    const { placeholder, className, label, wide, reverse, min, max, noValue, step } = this.props;
    const doNotInclude = 'wide reverse onValueChanged value className type min max step ' +
                         'disableInput inputOnly label noHoverHint noTooltip noValue logarithmicScale';
    const inheritedProps = excludeKeys(this.props, doNotInclude);
    const hoverHintOffset = reverse ? 1 - hoverHint : hoverHint;

    const sliderValue = this.scale.invert(value);
    const sliderWidth = this.sliderMax - this.sliderMin;
    const nSteps = (max - min) / step;
    const sliderStep = sliderWidth / nSteps;

    // HoverHint is in [0, 1]. Scale to corresponding slider position
    const scaledHoverHintOffset = sliderWidth * hoverHintOffset + this.sliderMin;

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
          <Tooltip style={{ left: `${100 * hoverHint}%` }}>
            { Number.parseFloat(this.scale(scaledHoverHintOffset).toFixed(2)) }
          </Tooltip>
        )}
        <input
          {...inheritedProps}
          id={id}
          type="range"
          value={sliderValue}
          min={this.sliderMin}
          max={this.sliderMax}
          step={sliderStep}
          className={`${className} ${styles.range}`}
          style={{ '--min': this.sliderMin, '--max': this.sliderMax, '--value': sliderValue, direction: reverse ? "rtl" : "ltr" }}
          onChange={this.onSliderChange}
          onMouseMove={this.onHover}
          onMouseLeave={this.onLeave}
        />
        <label htmlFor={id} className={`${styles.rangeLabel}`}>
          { label || placeholder }
        </label>
        <span className={styles.value}>
          {noValue ? "" : value}
        </span>
      </div>
    );
  }
}

NumericInput.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  disableInput: PropTypes.bool,
  inputOnly: PropTypes.bool,
  label: PropTypes.node,
  logarithmicScale: PropTypes.bool,
  max: PropTypes.number,
  min: PropTypes.number,
  reverse: PropTypes.bool,
  noHoverHint: PropTypes.bool,
  noTooltip: PropTypes.bool,
  noValue: PropTypes.bool,
  onValueChanged: PropTypes.func,
  placeholder: PropTypes.string.isRequired,
  step: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  wide: PropTypes.bool,
};

NumericInput.defaultProps = {
  className: '',
  disabled: false,
  disableInput: false,
  inputOnly: false,
  label: null,
  logarithmicScale: false,
  max: 100,
  min: 0,
  reverse: false,
  noHoverHint: false,
  noTooltip: false,
  noValue: false,
  onValueChanged: () => {},
  step: 1,
  value: 0,
  wide: true,
};

export default NumericInput;
