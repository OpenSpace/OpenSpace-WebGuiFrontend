import React, { Component } from 'react';
import DataManager, { TopicTypes } from '../../api/DataManager';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import LoadingString from '../common/LoadingString/LoadingString';
import Popover from '../common/Popover/Popover';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import Button from '../common/Input/Button/Button';
import Calendar from '../common/Calendar/Calendar';
import Picker from './Picker';
import Time from '../common/Input/Time/Time';
import ToggleContent from '../common/ToggleContent/ToggleContent';
import ScaleInput from '../common/Input/ScaleInput/ScaleInput';

import {
  TogglePauseScript,
  InterpolateTogglePauseScript,
  CurrentTimeKey,
  DeltaTime,
  ValuePlaceholder,
  InterpolateTimeScript,
  SetDeltaTimeScript,
  InterpolateDeltaTimeScript,
  InterpolateTimeRelativeScript,
  InterpolateDeltaTime
} from '../../api/keys';

import SimulationIncrement from './SimulationIncrement';
import styles from './TimePicker.scss';

/**
 * Make sure the date string contains a time zone
 * @param date
 * @param zone - the time zone in ISO 8601 format
 * @constructor
 */
const DateStringWithTimeZone = (date, zone = 'Z') =>
  (!date.includes('Z') ? `${date}${zone}` : date);

class TimePicker extends Component {
  static togglePause(e) {
    const shift = e.getModifierState("Shift");
    if (shift) {
      DataManager.runScript(TogglePauseScript);
    } else {
      DataManager.runScript(InterpolateTogglePauseScript);
    }
  }

  static realtime(e) {
    const shift = e.getModifierState("Shift");
    let script = '';
    if (shift) {
      script = SetDeltaTimeScript.replace(ValuePlaceholder, 1);
    } else {
      script = InterpolateDeltaTimeScript
        .replace(ValuePlaceholder, 1)
        .replace(ValuePlaceholder, 1); // interpolation time
    }
    DataManager.runScript(script);
  }

  constructor(props) {
    super(props);

    this.state = {
      time: new Date(),
      pendingTime: new Date(),
      isPaused: false,
      targetDeltaTime: 0,
      hasTime: false,
      showPopover: false,
      showCalendar: false,
      useLock: false,
      timeSubscriptionId: -1,
      deltaTimeSubscriptionId: -1
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
  }

  componentDidMount() {
    // subscribe to data
    this.state.timeSubscriptionId = DataManager
      .subscribe(CurrentTimeKey, this.timeSubscriptionCallback, TopicTypes.time);

    this.state.deltaTimeSubscriptionId = DataManager
      .subscribe(DeltaTime, this.deltaTimeSubscriptionCallback, TopicTypes.time);
  }

  componentWillUnmount() {
    DataManager.unsubscribe(CurrentTimeKey, this.state.timeSubscriptionId);
    DataManager.unsubscribe(DeltaTime, this.state.deltaTimeSubscriptionId);
  }

  get time() {
    return this.state.time.toUTCString();
  }

  get speed() {
    let increment = Math.abs(this.state.targetDeltaTime);
    const sign = Math.sign(this.state.targetDeltaTime) === -1 ? '-' : '';
    let unit = "second";

    if (increment === 1) {
      return "Realtime";
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

    return sign + increment + " " + unit + pluralSuffix + " / second" + (this.state.isPaused ? " (Paused)" : "");
  }

  get date() {
    const t = this.time;
    return t.split(" ", 4).join(" ");
  }

  get calendar() {
    const { time, showCalendar } = this.state;
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
    const { time, pendingTime } = this.state;
    return (
      <Popover
        className={Picker.Popover}
        title="Select date"
        closeCallback={this.togglePopover}
        detachable
      >
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <div style={{marginTop: 20}}>
            <Button onClick={this.toggleLock} title="Toggle lock" small transparent={!this.state.useLock}>
              <MaterialIcon icon={this.state.useLock ? 'lock' : 'lock_open'} />
            </Button>
          </div>
          <Time time={pendingTime} onChange={this.changeDate} />
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
          <SimulationIncrement />
        </div>
        <hr className={Popover.styles.delimiter} />

        <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
          <Button block smalltext onClick={TimePicker.togglePause}>
            {this.state.isPaused ? <MaterialIcon icon="play_arrow" /> : <MaterialIcon icon="pause" />}
          </Button>
          <Button block smalltext onClick={TimePicker.realtime}>
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
      pendingTime: new Date(this.state.time),
      useLock: false
    });
  }

  setDate(time) {
    this.setState({ time: new Date(time) });
    // Spice, that is handling the time parsing in OpenSpace does not support
    // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
    // is given.
    const fixedTimeString = time.toJSON().replace('Z', '');
    DataManager.setValue('__time', fixedTimeString);
  }

  setDateRelative(delta) {
    const newTime = new Date(this.state.time);
    newTime.setSeconds(newTime.getSeconds() + delta);

    this.setState({ time: newTime });
    // Spice, that is handling the time parsing in OpenSpace does not support
    // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
    // is given.

    const fixedTimeString = newTime.toJSON().replace('Z', '');
    DataManager.setValue('__time', fixedTimeString);
  }

  interpolateDate(time) {
    const interpolationTime = 1.0;
    const fixedTimeString = time.toJSON().replace('Z', '');

    const script = InterpolateTimeScript
      .replace(ValuePlaceholder, '"' + fixedTimeString + '"')
      .replace(ValuePlaceholder, interpolationTime);

    DataManager.runScript(script);
  }

  interpolateDateRelative(delta) {
    const interpolationTime = 1.0;

    const script = InterpolateTimeRelativeScript
      .replace(ValuePlaceholder, delta)
      .replace(ValuePlaceholder, interpolationTime);

    DataManager.runScript(script);
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
    this.setState({ showPopover: !this.state.showPopover });
  }

  toggleLock() {
    this.setState({
      useLock: !this.state.useLock,
      pendingTime: new Date(this.state.time)
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
    this.setState(newState);
  }

  /**
   * Callback for delta time subscription
   * @param message [object] - message object sent from Subscription
   */
  deltaTimeSubscriptionCallback(message) {
    const { isPaused, targetDeltaTime } = message;
    this.setState({ isPaused, targetDeltaTime });
  }

  render() {
    const { showPopover } = this.state;
    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover} className={`${styles.timePicker} ${showPopover ? Picker.Active : ''}`}>
          <div className={Picker.Title}>
            <span className={Picker.Name}>
              <LoadingString loading={!this.state.hasTime}>
                { this.time }
              </LoadingString>
            </span>
            <SmallLabel>{ this.state.hasTime ? this.speed : ""}</SmallLabel>
          </div>
        </Picker>

        { showPopover && this.popover }
      </div>
    );
  }
}

export default TimePicker;
