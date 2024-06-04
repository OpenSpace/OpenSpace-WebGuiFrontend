import React from 'react';
import { MdLock, MdLockOpen, MdViewDay } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

import {
  setPopoverVisibility, subscribeToEngineMode, subscribeToSessionRecording,
  subscribeToTime, unsubscribeToEngineMode,
  unsubscribeToSessionRecording, unsubscribeToTime
} from '../../api/Actions';
import {
  EngineModeCameraPath,
  EngineModeSessionRecordingPlayback,
  EngineModeUserControl,
  SessionStatePaused,
  SessionStatePlaying
} from '../../api/keys';
import Calendar from '../common/Calendar/Calendar';
import HorizontalDelimiter from '../common/HorizontalDelimiter/HorizontalDelimiter';
import Button from '../common/Input/Button/Button';
import Time from '../common/Input/Time/Time';
import LoadingString from '../common/LoadingString/LoadingString';
import Popover from '../common/Popover/Popover';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import { useContextRefs } from '../GettingStartedTour/GettingStartedContext';

import Picker from './Picker';
import SimulationIncrement from './SimulationIncrement';

import styles from './TimePicker.scss';

function TimePicker() {
  const [pendingTime, setPendingTime] = React.useState(new Date());
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [useLock, setUseLock] = React.useState(false);
  const refs = useContextRefs();

  const engineMode = useSelector((state) => state.engineMode.mode);
  const time = useSelector((state) => state.time.time);
  const targetDeltaTime = useSelector((state) => state.time.targetDeltaTime);
  const isPaused = useSelector((state) => state.time.isPaused);
  const popoverVisible = useSelector((state) => state.local.popovers.timePicker.visible);
  const sessionRecordingState = useSelector((state) => state.sessionRecording.recordingState);
  const luaApi = useSelector((state) => state.luaApi);

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(subscribeToTime());
    dispatch(subscribeToSessionRecording());
    dispatch(subscribeToEngineMode());
    return () => {
      dispatch(unsubscribeToTime());
      dispatch(unsubscribeToSessionRecording());
      dispatch(unsubscribeToEngineMode());
    };
  }, []);

  function setDate(newTime) {
    // Spice, that is handling the time parsing in OpenSpace does not support
    // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
    // is given.
    try {
      const fixedTimeString = newTime.toJSON().replace('Z', '');
      luaApi.time.setTime(fixedTimeString);
    } catch {
      luaApi.time.setTime(time);
    }
  }

  function setDateRelative(delta) {
    try {
      const newTime = new Date(time);
      newTime.setSeconds(newTime.getSeconds() + delta);
      // Spice, that is handling the time parsing in OpenSpace does not support
      // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
      // is given.
      const fixedTimeString = newTime.toJSON().replace('Z', '');
      luaApi.time.setTime(fixedTimeString);
    } catch {
      luaApi.time.setTime(time);
    }
  }

  function interpolateDate(newTime) {
    const fixedTimeString = newTime.toJSON().replace('Z', '');
    luaApi.time.interpolateTime(fixedTimeString);
  }

  function interpolateDateRelative(delta) {
    luaApi.time.interpolateTimeRelative(delta);
  }

  function toggleCalendar() {
    setShowCalendar(!showCalendar);
  }

  function realtime(e) {
    const shift = e.getModifierState('Shift');
    if (shift) {
      luaApi.time.setDeltaTime(1);
    } else {
      luaApi.time.interpolateDeltaTime(1);
    }
  }

  function now() {
    setDate(new Date());
  }

  function togglePopover() {
    dispatch(setPopoverVisibility({
      popover: 'timePicker',
      visible: !popoverVisible
    }));
  }

  function toggleLock() {
    setPendingTime(new Date(time));
    setUseLock(!useLock);
  }

  function timeLabel() {
    if (time) {
      try {
        return time.toUTCString();
      } catch {
        return time;
      }
    }
    return time;
  }

  function setToPendingTime() {
    setDate(pendingTime);
    setUseLock(false);
  }

  function interpolateToPendingTime() {
    interpolateDate(pendingTime);
    setUseLock(false);
  }

  function resetPendingTime() {
    setPendingTime(new Date(time));
    setUseLock(false);
  }

  function speedLabel() {
    let increment = Math.abs(targetDeltaTime);
    const isNegative = Math.sign(targetDeltaTime) === -1;
    const sign = isNegative ? '-' : '';
    let unit = 'second';

    if (increment === 1 && !isNegative) {
      return `Realtime${isPaused ? ' (Paused)' : ''}`;
    }

    (() => {
      if (increment < 60 * 2) {
        return;
      }
      increment /= 60;
      unit = 'minute';

      if (increment < 60 * 2) {
        return;
      }
      increment /= 60;
      unit = 'hour';

      if (increment < 24 * 2) {
        return;
      }
      increment /= 24;
      unit = 'day';

      if ((increment < 365) / (12 * 2)) {
        return;
      }
      increment /= 265 / 12;
      unit = 'month';

      if (increment < 12) {
        return;
      }
      increment /= 12;
      unit = 'year';
    })();

    increment = Math.round(increment);
    const pluralSuffix = (increment !== 1) ? 's' : '';

    return `${sign + increment} ${unit}${pluralSuffix} / second${isPaused ? ' (Paused)' : ''}`;
  }

  function changeDate(event) {
    if (useLock) {
      setPendingTime(new Date(event.time));
    } else if (event.interpolate) {
      if (event.relative) {
        interpolateDateRelative(event.delta);
      } else {
        interpolateDate(event.time);
      }
    } else if (event.relative) {
      setDateRelative(event.delta);
    } else {
      setDate(event.time);
    }
  }

  function calendar() {
    return showCalendar && (
      <div>
        <HorizontalDelimiter />
        <Calendar currentTime={time} onChange={changeDate} todayButton />
        <HorizontalDelimiter />
      </div>
    );
  }

  function lockOptions() {
    return useLock && (
      <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
        <Button onClick={interpolateToPendingTime} block smalltext>Interpolate</Button>
        <Button onClick={setToPendingTime} block smalltext>Set</Button>
        <Button onClick={resetPendingTime} block smalltext>Cancel</Button>
      </div>
    );
  }

  function popover() {
    const displayedTime = useLock ? pendingTime : time;
    return (
      <Popover
        className={`${styles.timePopover} ${Picker.Popover}`}
        title="Select date"
        closeCallback={() => togglePopover()}
        detachable
        attached
      >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <div style={{ marginTop: 20 }}>
            <Button onClick={toggleLock} title="Toggle lock" small transparent={!useLock}>
              { useLock ? <MdLock /> : <MdLockOpen /> }
            </Button>
          </div>
          {displayedTime && <Time time={displayedTime} onChange={changeDate} />}
          <div style={{ marginTop: 20 }}>
            <Button onClick={toggleCalendar} title="Toggle calendar" small transparent={!showCalendar}>
              <MdViewDay />
            </Button>
          </div>
        </div>

        {calendar()}
        {lockOptions()}

        <div className={Popover.styles.title}>Simulation speed</div>
        <div className={Popover.styles.content}>
          <SimulationIncrement />
        </div>
        <HorizontalDelimiter />

        <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
          <Button block smalltext onClick={realtime}>
            Realtime
          </Button>
          <Button block smalltext onClick={now}>
            Now
          </Button>
        </div>
      </Popover>
    );
  }

  // OBS! same as origin picker
  function pickerStyle() {
    const isSessionRecordingPlaying = (engineMode === EngineModeSessionRecordingPlayback) &&
      (sessionRecordingState === SessionStatePlaying);

    const isSessionRecordingPaused = (engineMode === EngineModeSessionRecordingPlayback) &&
      (sessionRecordingState === SessionStatePaused);

    const isCameraPathPlaying = (engineMode === EngineModeCameraPath);

    if (isSessionRecordingPaused) { // TODO: add camera path paused check
      return Picker.DisabledOrange;
    }
    if (isCameraPathPlaying || isSessionRecordingPlaying) {
      return Picker.DisabledBlue;
    }
    return '';
  }

  const enabled = (engineMode === EngineModeUserControl);
  const popoverEnabledAndVisible = popoverVisible && enabled;
  const disableClass = enabled ? '' : pickerStyle();

  const pickerClasses = [
    styles.timePicker,
    popoverEnabledAndVisible ? Picker.Active : '',
    disableClass
  ].join(' ');

  return (
    <div ref={(el) => { refs.current.Time = el; }} className={Picker.Wrapper}>
      <Picker onClick={enabled ? () => togglePopover() : undefined} className={pickerClasses}>
        <div className={Picker.Title}>
          <span className={Picker.Name}>
            <LoadingString loading={time === undefined}>
              { timeLabel() }
            </LoadingString>
          </span>
          <SmallLabel>{ targetDeltaTime === undefined ? '' : speedLabel()}</SmallLabel>
        </div>
      </Picker>

      { popoverEnabledAndVisible && popover() }
    </div>
  );
}

TimePicker.propTypes = {

};

TimePicker.defaultProps = {

};

export default TimePicker;
