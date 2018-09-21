import React, { Component } from 'react';
import DataManager, { TopicTypes } from '../../api/DataManager';
import LoadingString from '../common/LoadingString/LoadingString';
import Popover from '../common/Popover/Popover';
import SmallLabel from '../common/SmallLabel/SmallLabel';
import Button from '../common/Input/Button/Button';
import Calendar from '../common/Calendar/Calendar';
import Picker from './Picker';
import Time from '../common/Input/Time/Time';
import ToggleContent from '../common/ToggleContent/ToggleContent';

import {
  TogglePauseScript,
  InterpolateTogglePauseScript,
  CurrentTimeKey,
  DeltaTime,
  ValuePlaceholder,
  SetDeltaTimeScript,
  InterpolateDeltaTimeScript,
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
      isPaused: false,
      hasTime: false,
      showPopover: false,
      timeSubscriptionId: -1,
      deltaTimeSubscriptionId: -1,
    };

    this.timeSubscriptionCallback = this.timeSubscriptionCallback.bind(this);
    this.deltaTimeSubscriptionCallback = this.deltaTimeSubscriptionCallback.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.now = this.now.bind(this);
    this.setDate = this.setDate.bind(this);
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

  get date() {
    const t = this.time;
    return t.split(" ", 3).join(" ");
  }

  get calendar() {
    const { time } = this.state;
    return <Calendar selected={time} activeMonth={time} onChange={this.setDate} todayButton />;
  }

  get popover() {
    const { time } = this.state;
    return (
      <Popover
        className={Picker.Popover}
        title="Select date"
        closeCallback={this.togglePopover}
        detachable
      >
        <ToggleContent title={this.date}>{this.calendar}</ToggleContent>
        <hr className={Popover.styles.delimiter} />
        <div className={Popover.styles.title}>Select local time</div>
        <div className={Popover.styles.content}>
          <Time time={time} onChange={this.setDate} />
        </div>
        <hr className={Popover.styles.delimiter} />

        <div className={Popover.styles.title}>Simulation speed</div>
        <div className={Popover.styles.content}>
          <SimulationIncrement />
        </div>
        <hr className={Popover.styles.delimiter} />

        <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
          <Button block smalltext onClick={TimePicker.togglePause}>
            {this.state.isPaused ? "Play" : "Pause"}
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

  setDate(time) {
    this.setState({ time });
    // Spice, that is handling the time parsing in OpenSpace does not support
    // ISO 8601-style time zones (the Z). It does, however, always assume that UTC
    // is given.
    const fixedTimeString = time.toJSON().replace('Z', '');
    DataManager.setValue('__time', fixedTimeString);
  }

  togglePopover() {
    this.setState({ showPopover: !this.state.showPopover });
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
    this.setState({ time, hasTime: true });
  }

  /**
   * Callback for delta time subscription
   * @param message [object] - message object sent from Subscription
   */
  deltaTimeSubscriptionCallback(message) {
    const isPaused = message.isPaused;
    this.setState({ isPaused });
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
            <SmallLabel>Date</SmallLabel>
          </div>
        </Picker>

        { showPopover && this.popover }
      </div>
    );
  }
}

export default TimePicker;
