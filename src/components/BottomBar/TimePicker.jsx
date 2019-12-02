import React, { Component } from 'react';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import LoadingString from '../common/LoadingString/LoadingString';
import Popover from '../common/Popover/Popover';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import Button from '../common/Input/Button/Button';
import Calendar from '../common/Calendar/Calendar';
import Picker from './Picker';
import Time from '../common/Input/Time/Time';
import { sessionStatePlaying } from '../../api/keys';
import {
  subscribeToTime,
  unsubscribeToTime,
  setPopoverVisibility,
  subscribeToSessionRecording,
  unsubscribeToSessionRecording
} from '../../api/Actions';
import { connect } from 'react-redux';

import SimulationIncrement from './SimulationIncrement';
import styles from './TimePicker.scss';
import * as timeHelpers from '../../utils/timeHelpers';

class TimePicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pendingTime: new Date(),
      showCalendar: false,
      useLock: false,
    };

    this.timeSubscriptionCallback = this.timeSubscriptionCallback.bind(this);
    this.deltaTimeSubscriptionCallback = this.deltaTimeSubscriptionCallback.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.toggleCalendar = this.toggleCalendar.bind(this);
    this.toggleLock = this.toggleLock.bind(this);
    this.now = this.now.bind(this);
    this.changeDate = this.changeDate.bind(this);
    this.setToPendingTime = this.setToPendingTime.bind(this);
    this.interpolateToPendingTime = this.interpolateToPendingTime.bind(this);
    this.resetPendingTime = this.resetPendingTime.bind(this);
    this.togglePause = this.togglePause.bind(this);
    this.realtime = this.realtime.bind(this);
  }

  togglePause(e) {
    const openspace = this.props.luaApi;
    const shift = e.getModifierState("Shift");
    if (shift) {
      openspace.time.togglePause();
    } else {
      openspace.time.interpolateTogglePause();
    }
  }

  realtime(e) {
    const openspace = this.props.luaApi;
    const shift = e.getModifierState("Shift");
    let script = '';
    if (shift) {
      openspace.time.setDeltaTime(1);
    } else {
      openspace.time.interpolateDeltaTime(1);
    }
  }

  componentDidMount() {
    this.props.startSubscriptions();
  }

  componentWillUnmount() {
    this.props.stopSubscriptions();
  }

  get time() {
    return this.props.time && this.props.time.toUTCString();
  }

  get speed() {
    let increment = Math.abs(this.props.targetDeltaTime);
    const sign = Math.sign(this.props.targetDeltaTime) === -1 ? '-' : '';
    let unit = "second";

    if (increment === 1) {
      return "Realtime" + (this.props.isPaused ? " (Paused)" : "");
    }

    (() => {
      if (increment < 60 * 2) {
        return;
      }
      increment /= 60;
      unit = "minute";

      if (increment < 60 * 2) {
        return;
      }
      increment /= 60;
      unit = "hour";

      if (increment < 24 * 2) {
        return;
      }
      increment /= 24;
      unit = "day";

      if (increment < 365/12 * 2) {
        return
      }
      increment /= 265/12;
      unit = "month";

      if (increment < 12) {
        return;
      }
      increment /= 12;
      unit = "year";
    })();

    increment = Math.round(increment);
    const pluralSuffix = (increment !== 1) ? 's' : '';

    return sign + increment + " " + unit + pluralSuffix + " / second" + (this.props.isPaused ? " (Paused)" : "");
  }

  get date() {
    const t = this.time;
    return t.split(" ", 4).join(" ");
  }

  get calendar() {
    const { showCalendar } = this.state;
    const { time } = this.props;

    return showCalendar && <div>
      <hr className={Popover.styles.delimiter} />
      <Calendar selected={time} activeMonth={time} onChange={this.changeDate} todayButton />
      <hr className={Popover.styles.delimiter} />
      </div>;
  }

  get lockOptions() {
    const { useLock } = this.state;
    return useLock && <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
      <Button onClick={this.interpolateToPendingTime} block smalltext >Interpolate</Button>
      <Button onClick={this.setToPendingTime} block smalltext >Set</Button>
      <Button onClick={this.resetPendingTime} block smalltext >Cancel</Button>
    </div>
  }

  get popover() {
    const { useLock, pendingTime } = this.state;
    const { time } = this.props;

    return (
      <Popover
        className={Picker.Popover}
        title="Select date"
        closeCallback={this.togglePopover}
        detachable
        attached={true}
      >
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <div style={{marginTop: 20}}>
            <Button onClick={this.toggleLock} title="Toggle lock" small transparent={!this.state.useLock}>
              <MaterialIcon icon={this.state.useLock ? 'lock' : 'lock_open'} />
            </Button>
          </div>
          <Time time={useLock ? pendingTime : time} onChange={this.changeDate} />
          <div style={{marginTop: 20}}>
            <Button onClick={this.toggleCalendar} title="Toggle calendar" small transparent={!this.state.showCalendar}>
              <MaterialIcon icon="view_day" />
            </Button>
          </div>
        </div>

        {this.calendar}
        {this.lockOptions}

        <div className={Popover.styles.title}>Simulation speed</div>
        <div className={Popover.styles.content}>
          <SimulationIncrement/>
        </div>
        <hr className={Popover.styles.delimiter} />

        <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
          <Button block smalltext onClick={this.togglePause}>
            {this.props.isPaused ? <MaterialIcon icon="play_arrow" /> : <MaterialIcon icon="pause" />}
          </Button>
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

  setToPendingTime() {
    this.setDate(this.state.pendingTime);
    this.setState({
      useLock: false
    });
  }

  interpolateToPendingTime() {
    this.interpolateDate(this.state.pendingTime);
    this.setState({
      useLock: false
    });
  }

  resetPendingTime() {
    this.setState({
      pendingTime: new Date(this.props.time),
      useLock: false
    });
  }

  setDate(time) {
    this.setState({ time: new Date(time) });
    // Spice, that is handling the time parsing in OpenSpace does not support
    // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
    // is given.
    const fixedTimeString = time.toJSON().replace('Z', '');
    const openspace = this.props.luaApi;
    openspace.time.setTime(fixedTimeString);
  }

  setDateRelative(delta) {
    const newTime = new Date(this.props.time);
    newTime.setSeconds(newTime.getSeconds() + delta);

    this.setState({ time: newTime });
    // Spice, that is handling the time parsing in OpenSpace does not support
    // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
    // is given.

    const fixedTimeString = newTime.toJSON().replace('Z', '');
    const openspace = this.props.luaApi;
    openspace.time.setTime(fixedTimeString);
  }

  interpolateDate(time) {
    const fixedTimeString = time.toJSON().replace('Z', '');
    const openspace = this.props.luaApi;
    openspace.time.interpolateTime(fixedTimeString);
  }

  interpolateDateRelative(delta) {
    const openspace = this.props.luaApi;
    openspace.time.interpolateTimeRelative(delta);
  }

  changeDate(event) {
    const {time, interpolate, delta, relative} = event;
    if (this.state.useLock) {
      this.setState({ pendingTime: new Date(time)});
    } else if (interpolate) {
      if (relative) {
        this.interpolateDateRelative(delta);
      } else {
        this.interpolateDate(time);
      }
    } else {
      if (relative) {
        this.setDateRelative(delta);
      } else {
        this.setDate(time);
      }
    }
  }

  togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible)
  }

  toggleLock() {
    this.setState({
      useLock: !this.state.useLock,
      pendingTime: new Date(this.props.time)
    });
  }

  toggleCalendar() {
    this.setState({ showCalendar: !this.state.showCalendar });
  }

  now() {
    this.setDate(new Date());
  }

  /**
   * Callback for time subscription
   * @param message [object] - message object sent from Subscription
   */
  timeSubscriptionCallback(message) {
    const time = new Date(DateStringWithTimeZone(message.time));
    const newState = { time, hasTime: true };
    if (!this.state.useLock) {
      newState.pendingTime = new Date(time);
    }
    //this.setState(newState);
  }

  /**
   * Callback for delta time subscription
   * @param message [object] - message object sent from Subscription
   */
  deltaTimeSubscriptionCallback(message) {
    const { isPaused, targetDeltaTime } = message;
    //this.setState({ isPaused, targetDeltaTime });
  }

  render() {
    const { popoverVisible, sessionRecordingState } = this.props;
    const enabled = sessionRecordingState !== sessionStatePlaying;

    const popoverEnabledAndVisible = popoverVisible && enabled;

    const pickerClasses = [
      styles.timePicker,
      popoverEnabledAndVisible ? Picker.Active : '',
      enabled ? '' : styles.disabledBySessionPlayback
    ].join(' ');

    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={enabled && this.togglePopover} className={pickerClasses}>
          <div className={Picker.Title}>
            <span className={Picker.Name}>
              <LoadingString loading={this.props.time === undefined}>
                { this.time }
              </LoadingString>
            </span>
            <SmallLabel>{ this.props.targetDeltaTime === undefined ? "" : this.speed}</SmallLabel>
          </div>
        </Picker>

        { popoverEnabledAndVisible && this.popover }
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
    popoverVisible: state.local.popovers.timePicker.visible,
    sessionRecordingState: state.sessionRecording.recordingState,
    luaApi: state.luaApi
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    startSubscriptions: () => {
      dispatch(subscribeToTime());
      dispatch(subscribeToSessionRecording());
    },
    stopSubscriptions: () => {
      dispatch(unsubscribeToTime());
      dispatch(unsubscribeToSessionRecording());
    },
    setPopoverVisibility: (visible) => {
      dispatch(setPopoverVisibility({
        popover: 'timePicker',
        visible
      }));
    },
  }
}

TimePicker = connect(mapStateToProps, mapDispatchToProps)(TimePicker);

export default TimePicker;
