import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  setPopoverVisibility, subscribeToSessionRecording, subscribeToTime,
  unsubscribeToSessionRecording, unsubscribeToTime, 
  subscribeToEngineMode, unsubscribeToEngineMode
} from '../../api/Actions';
import {
  EngineModeCameraPath,
  EngineModeSessionRecordingPlayback,
  EngineModeUserControl,
  SessionStatePaused,
  SessionStatePlaying
} from '../../api/keys';
import Calendar from '../common/Calendar/Calendar';
import Button from '../common/Input/Button/Button';
import Time from '../common/Input/Time/Time';
import LoadingString from '../common/LoadingString/LoadingString';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Popover from '../common/Popover/Popover';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import Picker from './Picker';
import SimulationIncrement from './SimulationIncrement';
import styles from './TimePicker.scss';
import { useContextRefs } from '../GettingStartedTour/GettingStartedContext';

function TimePicker({ startSubscriptions, stopSubscriptions, time, isPaused, targetDeltaTime, luaApi, popoverVisible, setPopoverVisibility, engineMode, sessionRecordingState }) {

  const [pendingTime, setPendingTime] = React.useState(new Date());
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [useLock, setUseLock] = React.useState(false);
  const refs = useContextRefs();

  React.useEffect(() => {
    startSubscriptions();
    return () => stopSubscriptions();
  }, [startSubscriptions, stopSubscriptions])

  function timeLabel() {
    return time && time.toUTCString();
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

      if (increment < 365 / 12 * 2) {
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

  function date() {
    const t = timeLabel;
    return t.split(' ', 4).join(' ');
  }

  function calendar() {

    return showCalendar && (
    <div>
      <hr className={Popover.styles.delimiter} />
      <Calendar selected={time} activeMonth={time} onChange={changeDate} todayButton />
      <hr className={Popover.styles.delimiter} />
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
              <MaterialIcon icon={useLock ? 'lock' : 'lock_open'} />
            </Button>
          </div>
          <Time time={useLock ? pendingTime : time} onChange={changeDate} />
          <div style={{ marginTop: 20 }}>
            <Button onClick={toggleCalendar} title="Toggle calendar" small transparent={!showCalendar}>
              <MaterialIcon icon="view_day" />
            </Button>
          </div>
        </div>

        {calendar()}
        {lockOptions()}

        <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
          {/* TODO: Add on click behaviors (reset to start?)*/}
          <div style={{flex: 3}}>
            <Button block smalltext>
              Reset
            </Button>
          </div>
          <div style={{flex: 5}}>
            <Button block smalltext onClick={now}>
              Now
            </Button>
          </div>
          <div style={{flex: 3}}>
            {/* TODO: Add on click behavior (open up interesting times panel) */}
            <Button block smalltext>
              ...
            </Button>
          </div>
        </div>

        <div className={Popover.styles.title}>Simulation speed</div>
        <div className={Popover.styles.content}>
          <SimulationIncrement />
          <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
            <Button block smalltext onClick={realtime}>
              Realtime
            </Button>
          </div>
        </div>

        {/* <hr className={Popover.styles.delimiter} /> */}

      </Popover>
    );
  }

  // OBS! same as origin picker
  function pickerStyle() {
    const isSessionRecordingPlaying = (engineMode === EngineModeSessionRecordingPlayback) 
      && (sessionRecordingState === SessionStatePlaying);

    const isSessionRecordingPaused = (engineMode === EngineModeSessionRecordingPlayback) 
      && (sessionRecordingState === SessionStatePaused);

    const isCameraPathPlaying = (engineMode === EngineModeCameraPath);

    if (isSessionRecordingPaused) {  // TODO: add camera path paused check
      return Picker.DisabledOrange;
    }
    else if (isCameraPathPlaying || isSessionRecordingPlaying) {
      return Picker.DisabledBlue;
    }
    return '';
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

  function setDate(time) {
    // Spice, that is handling the time parsing in OpenSpace does not support
    // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
    // is given.
    const fixedTimeString = time.toJSON().replace('Z', '');
    luaApi.time.setTime(fixedTimeString);
  }

  function setDateRelative(delta) {
    const newTime = new Date(time);
    newTime.setSeconds(newTime.getSeconds() + delta);
    // Spice, that is handling the time parsing in OpenSpace does not support
    // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
    // is given.
    const fixedTimeString = newTime.toJSON().replace('Z', '');
    luaApi.time.setTime(fixedTimeString);
  }

  function interpolateDate(time) {
    const fixedTimeString = time.toJSON().replace('Z', '');
    luaApi.time.interpolateTime(fixedTimeString);
  }

  function interpolateDateRelative(delta) {
    luaApi.time.interpolateTimeRelative(delta);
  }

  function changeDate(event) {
    const {
      time, interpolate, delta, relative,
    } = event;
    if (useLock) {
      setPendingTime(new Date(time));
    } else if (interpolate) {
      if (relative) {
        interpolateDateRelative(delta);
      } else {
        interpolateDate(time);
      }
    } else if (relative) {
      setDateRelative(delta);
    } else {
      setDate(time);
    }
  }

  function togglePopover() {
    setPopoverVisibility(!popoverVisible);
  }

  function toggleLock() {
    setPendingTime(new Date(time));
    setUseLock(!useLock);
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

  const enabled = (engineMode === EngineModeUserControl);
  const popoverEnabledAndVisible = popoverVisible && enabled;
  const disableClass = enabled ? '' : pickerStyle();

  const pickerClasses = [
    styles.timePicker,
    popoverEnabledAndVisible ? Picker.Active : '',
    disableClass,
  ].join(' ');

  return (
    <div ref={el => refs.current["Time"] = el} className={Picker.Wrapper}>
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
  engineMode: PropTypes.string.isRequired,
  isPaused: PropTypes.bool,
  luaApi: PropTypes.object,
  popoverVisible: PropTypes.bool,
  sessionRecordingState: PropTypes.string.isRequired,
  targetDeltaTime: PropTypes.number,
  time: PropTypes.instanceOf(Date),
};

TimePicker.defaultProps = {
  isPaused: undefined,
  luaApi: undefined,
  popoverVisible: false,
  time: undefined,
  targetDeltaTime: undefined,
};

const mapStateToProps = state => ({
  engineMode: state.engineMode.mode,
  time: state.time.time,
  // deltaTime: state.time.deltaTime, // unused
  targetDeltaTime: state.time.targetDeltaTime,
  isPaused: state.time.isPaused,
  popoverVisible: state.local.popovers.timePicker.visible,
  sessionRecordingState: state.sessionRecording.recordingState,
  luaApi: state.luaApi,
});

const mapDispatchToProps = dispatch => ({
  startSubscriptions: () => {
    dispatch(subscribeToTime());
    dispatch(subscribeToSessionRecording());
    dispatch(subscribeToEngineMode());
  },
  stopSubscriptions: () => {
    dispatch(unsubscribeToTime());
    dispatch(unsubscribeToSessionRecording());
    dispatch(unsubscribeToEngineMode());
  },
  setPopoverVisibility: (visible) => {
    dispatch(setPopoverVisibility({
      popover: 'timePicker',
      visible,
    }));
  },
});

TimePicker = connect(mapStateToProps, mapDispatchToProps)(TimePicker);

export default TimePicker;
