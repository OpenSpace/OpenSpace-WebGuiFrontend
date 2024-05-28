import React from 'react';
import { MdFastForward, MdFastRewind, MdPause, MdPlayArrow } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { throttle } from 'lodash/function';

import { subscribeToTime, unsubscribeToTime } from '../../../../api/Actions';
import { round10 } from '../../../../utils/rounding';
import Button from '../../../common/Input/Button/Button';
import NumericInput from '../../../common/Input/NumericInput/NumericInput';
import ScaleInput from '../../../common/Input/ScaleInput/ScaleInput';
// import Select from '../../../common/Input/Select/Select';
import Select from './Select';
import Row from '../../../common/Row/Row';
import { useContextRefs } from '../../../GettingStartedTour/GettingStartedContext';

import styles from './SimulationIncrement.scss';

interface StepSizeLimits {
  min: number;
  max: number;
  step: number;
}

const updateDelayMs = 1000;
// Throttle the delta time updating, so that we don't accidentally flood
// the simulation with updates.
const updateDeltaTimeNow = (openspace: any, value: number, interpolationTime?: number) => {
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

function SimulationIncrement() {
  const [stepSize, setStepSize] = React.useState(Steps.seconds);
  const [beforeAdjust, setBeforeAdjust] = React.useState<number | null>(0);
  const refs = useContextRefs();

  // const deltaTime = useSelector((state) => state.time.deltaTime);
  const targetDeltaTime = useSelector((state: any) => state.time.targetDeltaTime);
  const isPaused = useSelector((state: any) => state.time.isPaused);
  const hasNextDeltaTimeStep = useSelector((state: any) => state.time.hasNextDeltaTimeStep);
  const hasPrevDeltaTimeStep = useSelector((state: any) => state.time.hasPrevDeltaTimeStep);
  const nextDeltaTimeStep = useSelector((state: any) => state.time.nextDeltaTimeStep);
  const prevDeltaTimeStep = useSelector((state: any) => state.time.prevDeltaTimeStep);
  const luaApi = useSelector((state: any) => state.luaApi);

  const dispatch = useDispatch();

  function startSubscriptions() {
    dispatch(subscribeToTime());
  }

  function stopSubscriptions() {
    dispatch(unsubscribeToTime());
  }

  React.useEffect(() => {
    startSubscriptions();
    return stopSubscriptions();
  }, []);

  function togglePause(e: React.MouseEvent) {
    const shift = e.getModifierState('Shift');
    if (shift) {
      luaApi.time.togglePause();
    } else {
      luaApi.time.interpolateTogglePause();
    }
  }

  function setDeltaTime(value: number) {
    const deltaTime = value * StepSizes[stepSize];
    if (!Number.isNaN(deltaTime) && luaApi) {
      updateDeltaTimeNow(luaApi, deltaTime);
    }
  }

  function setPositiveDeltaTime(value: number) {
    const dt = value;
    setDeltaTime(dt);
  }

  function setNegativeDeltaTime(value: number) {
    const dt = -value;
    setDeltaTime(dt);
  }

  function setQuickAdjust(value: number) {
    if (!luaApi) return;

    if (value !== 0) {
      const currentAdjust = beforeAdjust === null ? targetDeltaTime : beforeAdjust;
      const quickAdjust = currentAdjust + StepSizes[stepSize] * value ** 5;
      updateDeltaTimeNow(luaApi, quickAdjust);
    } else {
      updateDeltaTime.cancel();
      if (beforeAdjust !== null) {
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
    const adjustedNextDelta = round10(
      nextDeltaTimeStep / StepSizes[stepSize],
      StepPrecisions[stepSize]
    );
    const adjustedPrevDelta = round10(
      prevDeltaTimeStep / StepSizes[stepSize],
      StepPrecisions[stepSize]
    );

    const nextLabel = hasNextDeltaTimeStep ? `${adjustedNextDelta} ${stepSize} / second` : 'None';
    const prevLabel = hasPrevDeltaTimeStep ? `${adjustedPrevDelta} ${stepSize} / second` : 'None';

    return (
      <div className={styles.row}>
        <div style={{ flex: 3 }}>
          <div
            className={styles.button}
            onClick={setPrevDeltaTimeStep}
            ref={(el) => {
              refs.current.SpeedBackward = el;
            }}
          >
            <MdFastRewind />
            <p className={styles.deltaTimeStepLabel}>{prevLabel}</p>
          </div>
        </div>
        <div
          style={{ flex: 2 }}
          ref={(el) => {
            refs.current.Pause = el;
          }}
        >
          <div className={styles.button} onClick={togglePause}>
            {isPaused ? <MdPlayArrow /> : <MdPause />}
            <p className={styles.deltaTimeStepLabel}>{isPaused ? 'Play' : 'Pause'}</p>
          </div>
        </div>
        <div style={{ flex: 3 }}>
          <div
            className={styles.button}
            onClick={setNextDeltaTimeStep}
            ref={(el) => {
              refs.current.SpeedForward = el;
            }}
          >
            <MdFastForward />
            <p className={styles.deltaTimeStepLabel}>{nextLabel}</p>
          </div>
        </div>
      </div>
    );
  }

  const adjustedDelta = round10(targetDeltaTime / StepSizes[stepSize], StepPrecisions[stepSize]);

  const options = Object.values(Steps).map((step) => ({
    value: step,
    label: step,
    isSelected: step === stepSize
  }));

  return (
    <div>
      <div className={styles.title}>Display Unit</div>
      <Select
        // label='Display unit'
        menuPlacement='top'
        onChange={({ value }) => (Object.values(Steps).includes(value) ? setStepSize(value) : null)}
        options={options}
        value={stepSize}
      />

      <div style={{ height: '10px' }} />
      {/* <Row>
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
      </Row> */}
      <div style={{ height: '10px' }} />
      <ScaleInput
        defaultValue={0}
        label='Quick adjust'
        min={-10}
        max={10}
        onChange={setQuickAdjust}
      />

      <div style={{ height: '10px' }} />
      {deltaTimeStepsContol()}
    </div>
  );
}

export default SimulationIncrement;
