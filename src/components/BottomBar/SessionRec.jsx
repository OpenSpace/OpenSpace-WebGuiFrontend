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
  sessionStateIDLE,
  ValuePlaceholder
} from '../../api/keys';

import PlaybackFiles from './PlaybackFiles';
import styles from './SessionRec.scss';


class SessionRec extends Component {

  constructor(props) {
    super(props);

    this.state = {
      format: 'Binary',
      timeMode: 'timeImmediate',
      filenameRec: '',
      filenamePlayback: '',
      showPopover: false,
      recState: sessionStateIDLE,
      recStateSubscriptionId: -1
    };

    this.recStateSubscriptionCallback = this.recStateSubscriptionCallback.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.toggleRecording = this.toggleRecording.bind(this);
    this.stopRecording = this.stopRecording.bind();
    this.togglePlayback = this.togglePlayback.bind(this);
    this.stopPlayback = this.stopPlayback.bind();
    this.updateFilenamePlaybackValue = this.updateFilenamePlaybackValue.bind(this);
  }

  componentDidMount() {
    //Subscribe to session recording state in openspace (idle/recording/playback).
    // Necessary for updating the displayed rec/play state and buttons
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
                {this.state.recState == sessionStateIDLE ? <MaterialIcon icon="play_arrow" /> : <MaterialIcon icon="pause" />}
                  Recording
              </Button>
            </div>
          </div>
        </div>

        <hr className={Popover.styles.delimiter} />

        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <div style={{marginTop: 20}}>
            <PlaybackFiles />
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
                {this.state.recState == sessionStateIDLE ? <MaterialIcon icon="play_arrow" /> : <MaterialIcon icon="pause" />}
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
    const { recState } = this.state;

    //Uses idle/rec/play state from openspace to toggle between record/stop
    if (recState == sessionStateIDLE) {
      this.startRecording();
    } else {
      this.stopRecording();
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
    const { recState } = this.state;

    //Uses idle/rec/play state from openspace to toggle between play/stop
    if (recState == sessionStateIDLE) {
      this.startPlayback();
    } else {
      this.stopPlayback();
    }
  }

  startPlayback () {
    const { timeMode, filenamePlayback } = this.state;

    this.updateFilenamePlaybackValue(PlaybackFiles.playbackFile());

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
    if (!this.state.showPopover) {
      this.setState({ showPopover: true})
    } else {
      this.setState({ showPopover: false})
    }
  }

  /**
   * Callback for SessionRecording idle/play/record state subscription
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
