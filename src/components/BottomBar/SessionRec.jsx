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
import FilterList from '../common/FilterList/FilterList';
import ScenePaneListItem from '../Sidebar/ScenePaneListItem';
import Input from '../common/Input/Input/Input';

import {
  SessionRecordingFormatPlaceholder,
  SessionRecordingTimePlaceholder,
  SessionRecordingStartScript,
  SessionRecordingState,
  SessionRecordingStopScript,
  SessionPlaybackStartScript,
  SessionPlaybackStopScript,
  ValuePlaceholder
} from '../../api/keys';

import SimulationIncrement from './SimulationIncrement';
import styles from './SessionRec.scss';


class SessionRec extends Component {

  constructor(props) {
    super(props);

    this.state = {
      format: 'Binary',
      timeMode: 'timeImmediate',
      filenameRec: '',
      filenamePlayback: '',
      sessionMode: 'stopped',
      showPopover: false,
      recState: 0,
      recStateSubscriptionId: -1
    };

    this.recStateSubscriptionCallback = this.recStateSubscriptionCallback.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.toggleRecording = this.toggleRecording.bind(this);
    this.stopRecording = this.stopRecording.bind();
    this.togglePlayback = this.togglePlayback.bind(this);
    this.stopPlayback = this.stopPlayback.bind();
  }

  componentDidMount() {
        this.state.recStateSubscriptionId = DataManager
      .subscribe(SessionRecordingState, this.recStateSubscriptionCallback, TopicTypes.sessionRecording);
  }

  componentWillUnmount() {
    DataManager.unsubscribe(SessionRecordingState, this.state.recStateSubscriptionId);
  }

  get popover() {
    const { time } = this.state;
    var nodes = "first";
    var filterSubObjects = true;

    return (
      <Popover className={Picker.Popover} title="Session Rec Options" closeCallback={this.togglePopover} detachable >

        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <div style={{marginTop: 20}}>
            <input name='filenameRec' value={this.state.filenameRec} onChange={evt => this.updateFilenameRecValue(evt)}/>
            <div className="form-check">
              <input type="radio" value="Ascii" name="format" className="form-check-input"/> ASCII
            </div>
            <div className="form-check">
              <input type="radio" value="Binary" name="format" className="form-check-input" checked={true} /> Binary
            </div>
            <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
              <Button block onClick={this.toggleRecording} title="Toggle Recording" small transparent={false}>
                {this.state.recState == 0 ? <MaterialIcon icon="play_arrow" /> : <MaterialIcon icon="pause" />}
                  Recording
              </Button>
            </div>
          </div>
        </div>

        <hr className={Popover.styles.delimiter} />

        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <div style={{marginTop: 20}}>
            <input name="filenamePlayback" value={this.state.filenamePlayback} onChange={evt => this.updateFilenamePlaybackValue(evt)} />
            <div className="form-check">
              <input type="radio" value="timeImmediate" name="playbackTimeMode" className="form-check-input" checked={true} /> Immediate playback (forced time)
            </div>
            <div className="form-check">
              <input type="radio" value="timeRecorded" name="playbackTimeMode" className="form-check-input" /> Delayed playback (recorded time)
            </div>
            <div className="form-check">
              <input type="radio" value="timeApplication" name="playbackTimeMode" className="form-check-input" /> Delayed playback (application time)
            </div>
            <div className="form-check">
              <input type="radio" value="timeSimulation" name="playbackTimeMode" className="form-check-input" /> Delayed playback (simulation time)
            </div>
            <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
              <Button block onClick={this.togglePlayback} title="Toggle Playback" small transparent={false}>
                {this.state.recState == 0 ? <MaterialIcon icon="play_arrow" /> : <MaterialIcon icon="pause" />}
                  Playback
              </Button>
            </div>
          </div>
        </div>

      </Popover>
    );
  }

  updateFilenameRecValue(evt) {
    this.setState({
      filenameRec: evt.target.value
    });
  }

  updateFilenamePlaybackValue(evt) {
    this.setState({
      filenamePlayback: evt.target.value
    });
  }

  toggleRecording() {
    const { recState, sessionMode } = this.state;

    if (recState == 0) {
      this.startRecording();
      this.setState({
        sessionMode: 'recording'
      });
    } else {
      this.stopRecording();
      this.setState({
        sessionMode: 'stopped'
      });
    }
  }

  startRecording () {
    const { format, filenameRec } = this.state;

    if (format == 'Binary') {
      this.startRecordingBinary(filenameRec);
    } else if (format == 'Ascii') {
      this.startRecordingAscii(filenameRec);
    }
  }

  stopRecording() {
    DataManager.runScript(SessionRecordingStopScript);
  }

  startRecordingAscii(filename) {
    const script = SessionRecordingStartScript
        .replace(SessionRecordingFormatPlaceholder, "Ascii")
        .replace(ValuePlaceholder, filename);

    DataManager.runScript(script);
  }

  startRecordingBinary(filename) {
    const script = SessionRecordingStartScript
        .replace(SessionRecordingFormatPlaceholder, "")
        .replace(ValuePlaceholder, filename);

    DataManager.runScript(script);
  }

  togglePlayback() {
    const { recState, sessionMode } = this.state;

    if (recState == 0) {
      this.startPlayback();
      this.setState({
        sessionMode: 'playing'
      });
    } else {
      this.stopPlayback();
      this.setState({
        sessionMode: 'stopped'
      });
    }
  }

  startPlayback () {
    const { timeMode, filenamePlayback } = this.state;

    if (timeMode == 'timeImmediate') {
      this.startPlaybackImmediate(filenamePlayback);
    } else if (timeMode == 'timeRecorded') {
      this.startPlaybackRecordedTime(filenamePlayback);
    } else if (timeMode == 'timeApplication') {
      this.startPlaybackApplicationTime(filenamePlayback);
    } else if (timeMode == 'timeSimulation') {
      this.startPlaybackSimulationTime(filenamePlayback);
    }
  }

  stopPlayback() {
    DataManager.runScript(SessionPlaybackStopScript);
  }

  startPlaybackImmediate(filename) {
    const script = SessionPlaybackStartScript
        .replace(SessionRecordingTimePlaceholder, "")
        .replace(ValuePlaceholder, filename);

    DataManager.runScript(script);
  }

  startPlaybackRecordedTime(filename) {
    const script = SessionPlaybackStartScript
        .replace(SessionRecordingTimePlaceholder, "RecordedTime")
        .replace(ValuePlaceholder, filename);

    DataManager.runScript(script);
  }

  startPlaybackApplicationTime(filename) {
    const script = SessionPlaybackStartScript
        .replace(SessionRecordingTimePlaceholder, "ApplicationTime")
        .replace(ValuePlaceholder, filename);

    DataManager.runScript(script);
  }

  startPlaybackSimulationTime(filename) {
    const script = SessionPlaybackStartScript
        .replace(SessionRecordingTimePlaceholder, "SimulationTime")
        .replace(ValuePlaceholder, filename);

    DataManager.runScript(script);
  }

  togglePopover() {
    this.setState({ showPopover: !this.state.showPopover });
  }

  /**
   * Callback for delta time subscription
   * @param message [object] - message object sent from Subscription
   */
  recStateSubscriptionCallback(message) {
    const newRecState = message;
    this.setState( {recState: newRecState.state} );
  }

  render() {
    const { showPopover } = this.state;
    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover} className={`${styles.timePicker} ${showPopover ? Picker.Active : ''}`}>
          <div className={Picker.Title}>
            <span className={Picker.Name}>
              REC
            </span>
          </div>
        </Picker>

        { showPopover && this.popover }
      </div>
    );
  }
}

export default SessionRec;
