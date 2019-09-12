import React, { Component } from 'react';
import { throttle } from 'lodash/function';
import NumericInput from '../common/Input/NumericInput/NumericInput';
import Row from '../common/Row/Row';
import Select from '../common/Input/Select/Select';
import { round10 } from '../../utils/rounding';
import ScaleInput from '../common/Input/ScaleInput/ScaleInput';

import { subscribeToTime, unsubscribeToTime } from '../../api/Actions';
import { connect } from 'react-redux';

const updateDelayMs = 1000;
// Throttle the delta time updating, so that we don't accidentally flood
// the simulation with updates.
const updateDeltaTimeNow = (openspace, value, interpolationTime) => {
  // Calling interpolateDeltaTime with one or two arguments actually make a difference,
  // even if the second argument is undefined. This is because undefined is translated to
  // nil in the mapping to the underlying lua api.
  // Hence, we check for undefined below:
  if (interpolationTime === undefined) {
    openspace.time.interpolateDeltaTime(value);
  } else {
    openspace.time.interpolateDeltaTime(value, interpolationTime);
  }
};
const updateDeltaTime = throttle(updateDeltaTimeNow, updateDelayMs);

const Steps = {
  seconds: 'Seconds',
  minutes: 'Minutes',
  hours: 'Hours',
  days: 'Days',
  months: 'Months',
  years: 'Years',
};
const StepSizes = {
  [Steps.seconds]: 1,
  [Steps.minutes]: 60,
  [Steps.hours]: 3600,
  [Steps.days]: 86400,
  [Steps.months]: 2678400,
  [Steps.years]: 31536000,
};
const StepPrecisions = {
  [Steps.seconds]: 0,
  [Steps.minutes]: -3,
  [Steps.hours]: -4,
  [Steps.days]: -7,
  [Steps.months]: -10,
  [Steps.years]: -14,
};
const Limits = {
  [Steps.seconds]: { min: 0, max: 300, step: 1 },
  [Steps.minutes]: { min: 0, max: 300, step: 0.001 },
  [Steps.hours]: { min: 0, max: 300, step: 0.0001 },
  [Steps.days]: { min: 0, max: 10, step: 0.000001 },
  [Steps.months]: { min: 0, max: 10, step: 0.00000001 },
  [Steps.years]: { min: 0, max: 1, step: 0.0000000001 },
};
Object.freeze(Steps);
Object.freeze(StepSizes);
Object.freeze(StepPrecisions);
Object.freeze(Limits);

class SimulationIncrement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stepSize: Steps.seconds,
      quickAdjust: 1,
    };

    this.setPositiveDeltaTime = this.setPositiveDeltaTime.bind(this);
    this.setNegativeDeltaTime = this.setNegativeDeltaTime.bind(this);
    this.setStepSize = this.setStepSize.bind(this);
    this.setQuickAdjust = this.setQuickAdjust.bind(this);
  }

  componentDidMount() {
    this.props.startSubscription();
  }

  componentWillUnmount() {
    this.props.stopSubscription();
  }

  get stepSize() {
    const { stepSize } = this.state;
    return StepSizes[stepSize];
  }

  get limits() {
    const { stepSize } = this.state;
    return Limits[stepSize];
  }

  setDeltaTime(value) {
    const deltaTime = parseFloat(value) * this.stepSize;
    if (isNaN(deltaTime)) {
      return;
    }
    if (this.props.luaApi) {
      updateDeltaTimeNow(this.props.luaApi, deltaTime);
    }
  }

  setPositiveDeltaTime(event) {
    const dt = event.currentTarget.value;
    this.setDeltaTime(dt);
  }

  setNegativeDeltaTime(event) {
    const dt = -event.currentTarget.value;
    this.setDeltaTime(dt);
  }

  setStepSize({ value }) {
    if (!Object.values(Steps).includes(value)) return;

    this.setState({ stepSize: value });
  }

  setQuickAdjust(value) {
    if (!this.props.luaApi) {
      return;
    }
    if (value !== 0) {
      this.beforeAdjust = this.beforeAdjust || this.props.targetDeltaTime;
      const quickAdjust = this.beforeAdjust + this.stepSize * (value ** 5);
      updateDeltaTimeNow(this.props.luaApi, quickAdjust);
    } else {
      updateDeltaTime.cancel();
      updateDeltaTimeNow(this.props.luaApi, this.beforeAdjust || 0);
      this.beforeAdjust = null;
    }
  }

  render() {
    const { stepSize } = this.state;
    const { targetDeltaTime } = this.props;
    const adjustedDelta =
      round10(targetDeltaTime / this.stepSize, StepPrecisions[stepSize]);

    const options = Object.values(Steps)
      .map(step => ({ value: step, label: step, isSelected: step === stepSize }));

    return (
      <div>
        <Row>
        <Select
            label="Display unit"
            menuPlacement="top"
            onChange={this.setStepSize}
            options={options}
            value={stepSize}
          />
        </Row>
        <div style={{ height: '10px' }} />
        <Row>
          <NumericInput
            {...this.limits}
            disabled={!this.props.luaApi}
            onChange={this.setNegativeDeltaTime}
            placeholder={`Negative ${stepSize} / second`}
            value={-adjustedDelta}
            reverse
            noValue={adjustedDelta >= 0}
          />
          <NumericInput
            {...this.limits}
            disabled={!this.props.luaApi}
            onChange={this.setPositiveDeltaTime}
            placeholder={`${stepSize} / second`}
            value={adjustedDelta}
            noValue={adjustedDelta < 0}
          />
        </Row>
        <div style={{ height: '10px' }} />
        <ScaleInput
          defaultValue={0}
          label="Quick adjust"
          min={-10}
          max={10}
          onChange={this.setQuickAdjust}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    time: state.time.time,
    deltaTime: state.time.deltaTime,
    targetDeltaTime: state.time.targetDeltaTime,
    isPaused: state.time.isPaused,
    luaApi: state.luaApi
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    startSubscription: () => dispatch(subscribeToTime()),
    stopSubscription: () => dispatch(unsubscribeToTime())
  }
}

SimulationIncrement = connect(mapStateToProps, mapDispatchToProps)(SimulationIncrement);
export default SimulationIncrement;
