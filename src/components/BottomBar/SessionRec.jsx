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
import Row from '../common/Row/Row';
import Select from '../common/Input/Select/Select';
import Checkbox from '../common/Input/Checkbox/Checkbox';


import {
  SessionRecordingFormatPlaceholder,
  SessionRecordingTimePlaceholder,
  SessionRecordingStartScript,
  SessionRecordingState,
  SessionRecordingStopScript,
  SessionPlaybackStartScript,
  SessionPlaybackStopScript,
  sessionStateIDLE,
  sessionStateRECORDING,
  sessionStatePLAYING,
  ValuePlaceholder
} from '../../api/keys';

import styles from './SessionRec.scss';


class SessionRec extends Component {

  constructor(props) {
    super(props);

    this.state = {
      recAscii: false,
      forceTime: true,
      filenameRec: '',
      filenamePlayback: '',
      fileList: '',
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
    this.setPlaybackFile = this.setPlaybackFile.bind(this);
    this.playbackListCallback = this.playbackListCallback.bind(this);
    this.refreshPlaybackFilesList = this.refreshPlaybackFilesList.bind(this);
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

    const { filenamePlayback } = this.state;
    const options = Object.values(this.state.fileList)
      .map(fname => ({ value: fname, label: fname }));

    return (
      <Popover className={Picker.Popover} title="Session Record/Playback Options" closeCallback={this.togglePopover} detachable >

        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <div style={{marginTop: 20}}>
            Enter recording filename:
            <input name='filenameRec' value={this.state.filenameRec} onChange={evt => this.updateFilenameRecValue(evt)}/>
            <div style={{ height: '10px' }} />
            <div className="form-check">
              <Checkbox
                checked={this.state.recAscii}
                name="recAsciiMode"
                className="form-check-input"
                label="Record in ASCII file format"
                onChange={evt => this.setRecFormat(evt)}
              />
            </div>
            <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
              <Button block onClick={this.toggleRecording} title="Toggle Recording" small transparent={false}
                      disabled={this.state.recState == sessionStatePLAYING}>
                {this.state.recState == sessionStateIDLE ? <MaterialIcon icon="fiber_manual_record" /> : <MaterialIcon icon="stop" />}
                  Record
              </Button>
            </div>
          </div>
        </div>

        <hr className={Popover.styles.delimiter} />

        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <div style={{marginTop: 20}}>
          <div>
            <Row>
            <Select
              direction="up"
              label="Select playback file"
              onChange={this.setPlaybackFile}
              options={options}
              value={filenamePlayback}
            />
            </Row>
            <div style={{ height: '10px' }} />
            </div>
            <div className="form-check">
              <Checkbox
                checked={this.state.forceTime}
                name="forceTimeInput"
                className="form-check-input"
                label="Force time change to recorded time"
                onChange={evt => this.toggleTiming(evt)}
              />
            </div>
            <div className={`${Popover.styles.row} ${Popover.styles.content}`}>
              <Button block onClick={this.togglePlayback} title="Toggle Playback" small transparent={false}
                      disabled={this.state.recState == sessionStateRECORDING}>
                {this.state.recState == sessionStateIDLE ? <MaterialIcon icon="play_arrow" /> : <MaterialIcon icon="stop" />}
                  Play
              </Button>
            </div>
          </div>
        </div>

      </Popover>
    );
  }

  get filenamePlayback() {
    const { filenamePlayback } = this.state;
    return filenamePlayback;
  }

  setPlaybackFile({ value }) {
    this.setState({ filenamePlayback: value });
  }

  refreshPlaybackFilesList() {
    //When clicking to display sessionRecording menu, trigger openspace to
    // read its recording directory and provide a list of available playback
    // files (which will go to the specified callback file)
    this.state.playbackListSubscriptionId = DataManager
      .getValue('playbackList', this.playbackListCallback);
  }

  /**
   * Callback for response to request for list of available playback files
   * @param message [object] - message object sent from server module connection
   */
  playbackListCallback(message) {
    let fList = [];
    var listFiles = message;
    //parse 'listFiles' here by newline
    fList = String(listFiles.playbackList).split("\n");
    this.setState({fileList: fList});
  }

  changePlaybackFile(event) {
    this.setState({playbackFile: event.target.value});
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
    const { recAscii, filenameRec } = this.state;

    if (recAscii) {
      this.startRecordingAscii(filenameRec);
    } else {
      this.startRecordingBinary(filenameRec);
    }
    //Hide popover menu after starting record
    this.setState({ showPopover: false});
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
    const { forceTime, filenamePlayback } = this.state;

    if (forceTime) {
      this.startPlaybackImmediate(filenamePlayback);
    } else {
      this.startPlaybackRecordedTime(filenamePlayback);
    }
    //Hide popover menu after starting playback
    this.setState({ showPopover: false});
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

  setRecFormat(evt) {
    this.setState({recAscii: evt})
  }

  toggleTiming(evt) {
    this.setState({forceTime: evt});
  }

  togglePopover() {
    if (!this.state.showPopover) {
      this.refreshPlaybackFilesList();
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
            {this.state.recState == sessionStateIDLE ? <MaterialIcon /> : (this.state.recState == sessionStatePLAYING ? <MaterialIcon icon="play_arrow" /> : <MaterialIcon icon="fiber_manual_record" /> )}
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
