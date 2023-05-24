import React from 'react';
import { connect } from 'react-redux';
import { throttle } from 'lodash/function';

import { subscribeToTime, unsubscribeToTime } from '../../api/Actions';
import { round10 } from '../../utils/rounding';
import Button from '../common/Input/Button/Button';
import NumericInput from '../common/Input/NumericInput/NumericInput';
import ScaleInput from '../common/Input/ScaleInput/ScaleInput';
import Select from '../common/Input/Select/Select';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Row from '../common/Row/Row';
import { useContextRefs } from '../GettingStartedTour/GettingStartedContext';

import styles from './SimulationIncrement.scss';

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
  years: 'Years'
};
const StepSizes = {
  [Steps.seconds]: 1,
  [Steps.minutes]: 60,
  [Steps.hours]: 3600,
  [Steps.days]: 86400,
  [Steps.months]: 2678400,
  [Steps.years]: 31536000
};
const StepPrecisions = {
  [Steps.seconds]: 0,
  [Steps.minutes]: -3,
  [Steps.hours]: -4,
  [Steps.days]: -5,
  [Steps.months]: -7,
  [Steps.years]: -10
};
const Limits = {
  [Steps.seconds]: { min: 0, max: 300, step: 1 },
  [Steps.minutes]: { min: 0, max: 300, step: 0.001 },
  [Steps.hours]: { min: 0, max: 300, step: 0.0001 },
  [Steps.days]: { min: 0, max: 10, step: 0.000001 },
  [Steps.months]: { min: 0, max: 10, step: 0.00000001 },
  [Steps.years]: { min: 0, max: 1, step: 0.0000000001 }
};
Object.freeze(Steps);
Object.freeze(StepSizes);
Object.freeze(StepPrecisions);
Object.freeze(Limits);

function SimulationIncrement({
  hasNextDeltaTimeStep, hasPrevDeltaTimeStep, nextDeltaTimeStep,
  prevDeltaTimeStep, startSubscriptions, targetDeltaTime, isPaused, stopSubscriptions, luaApi
}) {
  const [stepSize, setStepSize] = React.useState(Steps.seconds);
  const [beforeAdjust, setBeforeAdjust] = React.useState(0);
  const refs = useContextRefs();

  React.useEffect(() => {
    startSubscriptions();
    return stopSubscriptions();
  }, []);

  function togglePause(e) {
    const shift = e.getModifierState('Shift');
    if (shift) {
      luaApi.time.togglePause();
    } else {
      luaApi.time.interpolateTogglePause();
    }
  }

  function setDeltaTime(value) {
    const deltaTime = parseFloat(value) * StepSizes[stepSize];
    if (Number.isNaN(deltaTime)) {
      return;
    }
    if (luaApi) {
      updateDeltaTimeNow(luaApi, deltaTime);
    }
  }

  function setPositiveDeltaTime(value) {
    const dt = value;
    setDeltaTime(dt);
  }

  function setNegativeDeltaTime(value) {
    const dt = -value;
    setDeltaTime(dt);
  }

  function setQuickAdjust(value) {
    if (!luaApi) {
      return;
    }
    if (value !== 0) {
      setBeforeAdjust(beforeAdjust || targetDeltaTime);
      const quickAdjust = beforeAdjust + StepSizes[stepSize] * (value ** 5);
      updateDeltaTimeNow(luaApi, quickAdjust);
    } else {
      updateDeltaTime.cancel();
      if (beforeAdjust) {
        updateDeltaTimeNow(luaApi, beforeAdjust);
      }
      setBeforeAdjust(null);
    }
  }

  function setNextDeltaTimeStep() {
    luaApi.time.interpolateNextDeltaTimeStep();
  }

  function setPrevDeltaTimeStep() {
    luaApi.time.interpolatePreviousDeltaTimeStep();
  }

  function deltaTimeStepsContol() {
    const adjustedNextDelta =
      round10(nextDeltaTimeStep / StepSizes[stepSize], StepPrecisions[stepSize]);
    const adjustedPrevDelta =
      round10(prevDeltaTimeStep / StepSizes[stepSize], StepPrecisions[stepSize]);

    const nextLabel = hasNextDeltaTimeStep ? `${adjustedNextDelta} ${stepSize} / second` : 'None';
    const prevLabel = hasPrevDeltaTimeStep ? `${adjustedPrevDelta} ${stepSize} / second` : 'None';

    return (
      <Row>
        <div style={{ flex: 3 }}>
          <Button
            block
            disabled={!hasPrevDeltaTimeStep}
            onClick={setPrevDeltaTimeStep}
            ref={(el) => { refs.current.SpeedBackward = el; }}
          >
            <MaterialIcon icon="fast_rewind" />
          </Button>
          <p className={styles.deltaTimeStepLabel}>
            {prevLabel}
          </p>
        </div>
        <div style={{ flex: 2 }} ref={(el) => { refs.current.Pause = el; }}>
          <Button block onClick={togglePause}>
            {isPaused ? <MaterialIcon icon="play_arrow" /> : <MaterialIcon icon="pause" />}
          </Button>
        </div>
        <div style={{ flex: 3 }}>
          <Button
            block
            disabled={!hasNextDeltaTimeStep}
            onClick={setNextDeltaTimeStep}
            ref={(el) => { refs.current.SpeedForward = el; }}
          >
            <MaterialIcon icon="fast_forward" />
          </Button>
          <p className={styles.deltaTimeStepLabel}>
            {nextLabel}
          </p>
        </div>
      </Row>
    );
  }

  const adjustedDelta =
    round10(targetDeltaTime / StepSizes[stepSize], StepPrecisions[stepSize]);

  const options = Object.values(Steps)
    .map((step) => ({ value: step, label: step, isSelected: step === stepSize }));

  return (
    <div>
      <Row>
        <Select
          label="Display unit"
          menuPlacement="top"
          onChange={({ value }) => (
            Object.values(Steps).includes(value) ? setStepSize(value) : null
          )}
          options={options}
          value={stepSize}
        />
      </Row>
      <div style={{ height: '10px' }} />
      <Row>
        <NumericInput
          {...Limits[stepSize]}
          disabled={!luaApi}
          onValueChanged={setNegativeDeltaTime}
          placeholder={`Negative ${stepSize} / second`}
          value={-adjustedDelta}
          reverse
          noValue={adjustedDelta >= 0}
          showOutsideRangeHint={false}
        />
        <NumericInput
          {...Limits[stepSize]}
          disabled={!luaApi}
          onValueChanged={setPositiveDeltaTime}
          placeholder={`${stepSize} / second`}
          value={adjustedDelta}
          noValue={adjustedDelta < 0}
          showOutsideRangeHint={false}
        />
      </Row>
      <div style={{ height: '10px' }} />
      <ScaleInput
        defaultValue={0}
        label="Quick adjust"
        min={-10}
        max={10}
        onChange={setQuickAdjust}
      />
      <div style={{ height: '10px' }} />
      {deltaTimeStepsContol()}
    </div>
  );
}

const mapStateToProps = (state) => ({
  deltaTime: state.time.deltaTime,
  targetDeltaTime: state.time.targetDeltaTime,
  isPaused: state.time.isPaused,
  hasNextDeltaTimeStep: state.time.hasNextDeltaTimeStep,
  hasPrevDeltaTimeStep: state.time.hasPrevDeltaTimeStep,
  nextDeltaTimeStep: state.time.nextDeltaTimeStep,
  prevDeltaTimeStep: state.time.prevDeltaTimeStep,
  luaApi: state.luaApi
});

const mapDispatchToProps = (dispatch) => ({
  startSubscriptions: () => {
    dispatch(subscribeToTime());
  },
  stopSubscriptions: () => {
    dispatch(unsubscribeToTime());
  }
});

SimulationIncrement = connect(mapStateToProps, mapDispatchToProps)(SimulationIncrement);
export default SimulationIncrement;
