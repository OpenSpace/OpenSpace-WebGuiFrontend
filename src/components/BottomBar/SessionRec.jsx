import React, { Component } from 'react';
import { connect } from 'react-redux';

import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Popover from '../common/Popover/Popover';
import Button from '../common/Input/Button/Button';
import Picker from './Picker';
import Input from '../common/Input/Input/Input';
import Row from '../common/Row/Row';
import Select from '../common/Input/Select/Select';
import Checkbox from '../common/Input/Checkbox/Checkbox';
import subStateToProps from '../../utils/subStateToProps';

import {
  sessionStateIdle,
  sessionStateRecording,
  sessionStatePlaying,
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
      showPopover: false,
    };

    this.togglePopover = this.togglePopover.bind(this);
    this.toggleRecording = this.toggleRecording.bind(this);
    this.togglePlayback = this.togglePlayback.bind(this);
    this.stopPlayback = this.stopPlayback.bind();
    this.updateFilenamePlaybackValue = this.updateFilenamePlaybackValue.bind(this);
    this.setPlaybackFile = this.setPlaybackFile.bind(this);
  }

  componentDidMount() {
    //Subscribe to session recording state in openspace (idle/recording/playback).
    // Necessary for updating the displayed rec/play state and buttons
    //this.state.recStateSubscriptionId = DataManager
    //  .subscribe(SessionRecordingState, this.recStateSubscriptionCallback, TopicTypes.sessionRecording);

    // emiax TODO.
    this.props.subscribe();
  }

  componentWillUnmount() {
   // DataManager.unsubscribe(SessionRecordingState, this.state.recStateSubscriptionId);
   // emiax TODO.
   this.props.unsubscribe();
  }

  get popover() {
    const { filenamePlayback } = this.state;

    const options = Object.values(this.props.fileList)
      .map(fname => ({ value: fname, label: fname }));

    const fileNameLabel = <span>Name of recording</span>;
    const textFormatLabel = <span>Text file format</span>;

    return (
      <Popover className={Picker.Popover}
               closeCallback={this.togglePopover}
               title="Record session"
               attached={true}
               detachable >
        <div className={Popover.styles.content}>    
          <Checkbox
            checked={this.state.recAscii}
            name="recAsciiMode"
            label={textFormatLabel}
            onChange={evt => this.setRecFormat(evt)}
          />
          <Row>
            <Input value={this.props.recordingFilename}
                   label={fileNameLabel}
                   placeholder={"Enter recording filename..."}
                   onChange={evt => this.updateFilenameRecValue(evt)} />

            <div className={Popover.styles.row}>
              <Button onClick={this.toggleRecording}
                      title="Toggle Recording"
                      disabled={this.state.recState == sessionStatePlaying}
                      style={{width: 90}}>
                {
                  this.state.recState == sessionStateIdle ?
                    <MaterialIcon icon="fiber_manual_record" /> :
                    <MaterialIcon icon="stop" />
                }
                <span style={{marginLeft: 5}}>Record</span>
              </Button>
            </div>
          </Row>
        </div>
        <hr className={Popover.styles.delimiter} />
        <div className={Popover.styles.title}>Playback session</div>
        <div className={Popover.styles.content}>
          <Checkbox
            checked={this.state.forceTime}
            name="forceTimeInput"
            label="Force time change to recorded time"
            onChange={evt => this.toggleTiming(evt)}
          />        
          <Row>
            <Select
              direction="up"
              label="Select playback file"
              onChange={this.setPlaybackFile}
              options={options}
              value={filenamePlayback}
            />
            <div className={Popover.styles.row}>
              <Button onClick={this.togglePlayback} title="Toggle Playback"
                      block small transparent={false}
                      disabled={this.state.recState == sessionStateRecording}
                      style={{width: 90}} >
                {
                  this.state.recState == sessionStateIdle ?
                    <MaterialIcon icon="play_arrow" /> :
                    <MaterialIcon icon="stop" />
                }
                <span style={{marginLeft: 5}}>Play</span>
              </Button>
            </div>
          </Row>
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
    //this.state.playbackListSubscriptionId = DataManager
    //  .getValue('playbackList', this.playbackListCallback);

      // emiax TODO.
  }

  /**
   * Callback for response to request for list of available playback files
   * @param message [object] - message object sent from server module connection
   */

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
    if (recState == sessionStateIdle) {
      this.startRecording();
    } else {
      this.props.stopRecording();
    }
  }

  startRecording () {
    const { recAscii, filenameRec } = this.state;
    if (recAscii) {
      this.props.startRecordingAscii(filenameRec);
    } else {
      this.props.startRecordingBinary(filenameRec);
    }
    //Hide popover menu after starting record
    this.setState({ showPopover: false});
  }

  togglePlayback() {
    const { recState } = this.state;

    //Uses idle/rec/play state from openspace to toggle between play/stop
    if (recState == sessionStateIdle) {
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
    //DataManager.runScript(SessionPlaybackStopScript);
    // emiax TODO
  }

  setRecFormat(evt) {
    this.setState({recAscii: evt})
  }

  toggleTiming(evt) {
    this.setState({forceTime: evt});
  }

  togglePopover() {
    if (!this.state.showPopover) {
      this.props.refreshPlaybackFilesList();
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
            {
              this.state.recState == sessionStateIdle ?
                null :
                (this.state.recState == sessionStatePlaying ?
                  <MaterialIcon icon="play_arrow" /> :
                  <MaterialIcon icon="fiber_manual_record" /> )}
              REC
            </span>
          </div>
        </Picker>

        { showPopover && this.popover }
      </div>
    );
  }
}

const mapSubStateToProps = ({sessionRecording, sessionRecordingPopover, luaApi}) => {
  return {
    fileList: [],
    startRecordingAscii: filename => {
      luaApi.sessionRecording.startRecordingAscii(filename);
    },
    startRecordingBinary: filename => {
      luaApi.sessionRecording.startRecordingBinary(filename);
    },
    stopRecording: () => {
      luaApi.sessionRecording.stopRecording()
    },
    startPlaybackImmediate: filename => {
      luaApi.sessionRecording.startPlayback('', filename);
    },
    startPlaybackRecordedTime: filename => {
      luaApi.sessionRecording.startPlayback('RecordedTime', filename);
    }
  };
};

const mapStateToSubState = (state) => ({
  sessionRecording: state.sessionRecording,
  originPickerPopover: state.local.popovers.sessionRecording,
  luaApi: state.luaApi
});

const mapDispatchToProps = (dispatch) => {
  return {
    subscribe: () => {

    },
    ubsubscribe: () => {

    },
    refreshPlaybackFilesList: () => {

    },
    setNavigationAction: (action) => {
      dispatch(setNavigationAction(action))
    },
    setPopoverVisibility: (visible) => {
      dispatch(setPopoverVisibility({
        popover: 'sessionRecording',
        visible
      }));
    },
  }
}


SessionRec = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps
)(SessionRec);

export default SessionRec;
