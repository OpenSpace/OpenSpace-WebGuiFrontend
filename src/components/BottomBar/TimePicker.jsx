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

class TimePicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pendingTime: new Date(),
      showCalendar: false,
      useLock: false,
    };

    this.togglePopover = this.togglePopover.bind(this);
    this.toggleCalendar = this.toggleCalendar.bind(this);
    this.toggleLock = this.toggleLock.bind(this);
    this.now = this.now.bind(this);
    this.changeDate = this.changeDate.bind(this);
    this.setToPendingTime = this.setToPendingTime.bind(this);
    this.interpolateToPendingTime = this.interpolateToPendingTime.bind(this);
    this.resetPendingTime = this.resetPendingTime.bind(this);
    this.realtime = this.realtime.bind(this);
  }

  componentDidMount() {
    this.props.startSubscriptions();
  }

  componentWillUnmount() {
    this.props.stopSubscriptions();
  }

  get timeLabel() {
    const { time } = this.props;

    return time && time.toUTCString();
  }

  get speedLabel() {
    const { isPaused, targetDeltaTime } = this.props;

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

  get date() {
    const t = this.timeLabel;
    return t.split(' ', 4).join(' ');
  }

  get calendar() {
    const { showCalendar } = this.state;
    const { time } = this.props;
    return showCalendar && (
    <div>
      <hr className={Popover.styles.delimiter} />
      <Calendar selected={time} activeMonth={time} onChange={this.changeDate} todayButton />
      <hr className={Popover.styles.delimiter} />
    </div>
    );
  }

  get lockOptions() {
    const { useLock } = this.state;
    return useLock && (
      <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
        <Button onClick={this.interpolateToPendingTime} block smalltext>Interpolate</Button>
        <Button onClick={this.setToPendingTime} block smalltext>Set</Button>
        <Button onClick={this.resetPendingTime} block smalltext>Cancel</Button>
      </div>
    );
  }

  get popover() {
    const { useLock, pendingTime, showCalendar } = this.state;
    const { time } = this.props;

    return (
      <Popover
        className={`${styles.timePopover} ${Picker.Popover}`}
        title="Select date"
        closeCallback={this.togglePopover}
        detachable
        attached
      >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <div style={{ marginTop: 20 }}>
            <Button onClick={this.toggleLock} title="Toggle lock" small transparent={!useLock}>
              <MaterialIcon icon={useLock ? 'lock' : 'lock_open'} />
            </Button>
          </div>
          <Time time={useLock ? pendingTime : time} onChange={this.changeDate} />
          <div style={{ marginTop: 20 }}>
            <Button onClick={this.toggleCalendar} title="Toggle calendar" small transparent={!showCalendar}>
              <MaterialIcon icon="view_day" />
            </Button>
          </div>
        </div>

        {this.calendar}
        {this.lockOptions}

        <div className={Popover.styles.title}>Simulation speed</div>
        <div className={Popover.styles.content}>
          <SimulationIncrement />
        </div>
        <hr className={Popover.styles.delimiter} />

        <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
          <Button block smalltext onClick={this.realtime}>
            Realtime
          </Button>
          <Button block smalltext onClick={this.now}>
            Now
          </Button>
        </div>
      </Popover>
    );
  }

  // OBS! same as origin picker
  get pickerStyle() {
    const { engineMode, sessionRecordingState} = this.props;

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

  setToPendingTime() {
    const { pendingTime } = this.state;
    this.setDate(pendingTime);
    this.setState({
      useLock: false,
    });
  }

  interpolateToPendingTime() {
    const { pendingTime } = this.state;
    this.interpolateDate(pendingTime);
    this.setState({ useLock: false });
  }

  resetPendingTime() {
    const { time } = this.props;
    this.setState({
      pendingTime: new Date(time),
      useLock: false,
    });
  }

  setDate(time) {
    const { luaApi } = this.props;
    // Spice, that is handling the time parsing in OpenSpace does not support
    // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
    // is given.
    const fixedTimeString = time.toJSON().replace('Z', '');
    luaApi.time.setTime(fixedTimeString);
  }

  setDateRelative(delta) {
    const { luaApi, time } = this.props;
    const newTime = new Date(time);
    newTime.setSeconds(newTime.getSeconds() + delta);
    // Spice, that is handling the time parsing in OpenSpace does not support
    // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
    // is given.
    const fixedTimeString = newTime.toJSON().replace('Z', '');
    luaApi.time.setTime(fixedTimeString);
  }

  interpolateDate(time) {
    const { luaApi } = this.props;
    const fixedTimeString = time.toJSON().replace('Z', '');
    luaApi.time.interpolateTime(fixedTimeString);
  }

  interpolateDateRelative(delta) {
    const { luaApi } = this.props;
    luaApi.time.interpolateTimeRelative(delta);
  }

  changeDate(event) {
    const { useLock } = this.state;
    const {
      time, interpolate, delta, relative,
    } = event;
    if (useLock) {
      this.setState({ pendingTime: new Date(time) });
    } else if (interpolate) {
      if (relative) {
        this.interpolateDateRelative(delta);
      } else {
        this.interpolateDate(time);
      }
    } else if (relative) {
      this.setDateRelative(delta);
    } else {
      this.setDate(time);
    }
  }

  togglePopover() {
    const { popoverVisible } = this.props;
    this.props.setPopoverVisibility(!popoverVisible);
  }

  toggleLock() {
    const { useLock } = this.state;
    const { time } = this.props;
    this.setState({
      useLock: !useLock,
      pendingTime: new Date(time),
    });
  }

  toggleCalendar() {
    const { showCalendar } = this.state;
    this.setState({ showCalendar: !showCalendar });
  }

  realtime(e) {
    const { luaApi } = this.props;
    const shift = e.getModifierState('Shift');
    if (shift) {
      luaApi.time.setDeltaTime(1);
    } else {
      luaApi.time.interpolateDeltaTime(1);
    }
  }

  now() {
    this.setDate(new Date());
  }

  render() {
    const {
      popoverVisible, targetDeltaTime, time, engineMode
    } = this.props;

    const enabled = (engineMode === EngineModeUserControl);
    const popoverEnabledAndVisible = popoverVisible && enabled;
    const disableClass = enabled ? '' : this.pickerStyle;

    const pickerClasses = [
      styles.timePicker,
      popoverEnabledAndVisible ? Picker.Active : '',
      disableClass,
    ].join(' ');

    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={enabled ? this.togglePopover : undefined} className={pickerClasses}>
          <div className={Picker.Title}>
            <span className={Picker.Name}>
              <LoadingString loading={time === undefined}>
                { this.timeLabel }
              </LoadingString>
            </span>
            <SmallLabel>{ targetDeltaTime === undefined ? '' : this.speedLabel}</SmallLabel>
          </div>
        </Picker>

        { popoverEnabledAndVisible && this.popover }
      </div>
    );
  }
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
