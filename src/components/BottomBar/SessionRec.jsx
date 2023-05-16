import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  refreshSessionRecording,
  subscribeToEngineMode,
  subscribeToSessionRecording,
  unsubscribeToEngineMode,
  unsubscribeToSessionRecording
} from '../../api/Actions';
import {
  EngineModeCameraPath,
  EngineModeUserControl,
  SessionStateIdle,
  SessionStatePaused,
  SessionStatePlaying,
  SessionStateRecording
} from '../../api/keys';
import subStateToProps from '../../utils/subStateToProps';
import Button from '../common/Input/Button/Button';
import Checkbox from '../common/Input/Checkbox/Checkbox';
import Input from '../common/Input/Input/Input';
import InfoBox from '../common/InfoBox/InfoBox';
import Select from '../common/Input/Select/Select';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';
import Picker from './Picker';
import styles from './SessionRec.scss';

class SessionRec extends Component {
  constructor(props) {
    super(props);

    this.state = {
      useTextFormat: false,
      forceTime: true,
      filenameRecording: '',
      filenamePlayback: undefined,
      shouldOutputFrames: false,
      outputFramerate: 60,
      loopPlayback: false
    };

    this.togglePopover = this.togglePopover.bind(this);
    this.toggleRecording = this.toggleRecording.bind(this);
    this.togglePlayback = this.togglePlayback.bind(this);
    this.setPlaybackFile = this.setPlaybackFile.bind(this);
    this.setForceTiming = this.setForceTiming.bind(this);
    this.setLoopPlayback = this.setLoopPlayback.bind(this);
    this.setUseTextFormat = this.setUseTextFormat.bind(this);
    this.setShouldOutputFrames = this.setShouldOutputFrames.bind(this);
    this.togglePlaybackPaused = this.togglePlaybackPaused.bind(this);
    this.stopPlayback = this.stopPlayback.bind(this);
  }

  componentDidMount() {
    this.props.subscribe();
  }

  componentWillUnmount() {
    this.props.unsubscribe();
  }

  get isIdle() {
    const { recordingState } = this.props;
    return (recordingState === SessionStateIdle);
  }

  get picker() {
    const { engineMode, recordingState } = this.props;
    const { showPopover } = this.state;
    const classes = [];
    let onClick = this.togglePopover;

    // The picker works and looks differently depending on the
    // different states and modes
    if (engineMode === EngineModeCameraPath) {
      classes.push(Picker.DisabledBlue);
      onClick = undefined;
    } else if (recordingState === SessionStateRecording) {
      classes.push(Picker.Red);
      onClick = this.toggleRecording;
    } else if (recordingState === SessionStatePlaying) {
      classes.push(Picker.Blue);
      onClick = undefined;
    } else if (recordingState === SessionStatePaused) {
      classes.push(Picker.Orange);
      onClick = undefined;
    } else if (showPopover) {
      classes.push(Picker.Active);
    }

    return (
      <Picker
        onClick={onClick}
        className={classes.join(' ')}
        refKey="SessionRecording"
      >
        { this.pickerContent }
      </Picker>
    );
  }

  get pickerContent() {
    const { recordingState } = this.props;
    switch (recordingState) {
    case SessionStateRecording:
      return (
        <div>
          <MaterialIcon icon="videocam" />
          {' Stop recording'}
        </div>
      );
    case SessionStatePlaying:
      return (
        <>
          <div className={styles.playbackButton} onClick={this.togglePlaybackPaused}>
            <MaterialIcon icon="pause" />
            {' Pause'}
          </div>
          <div onClick={this.stopPlayback}>
            <MaterialIcon icon="stop" />
            {' Stop playback'}
          </div>
        </>
      );
    case SessionStatePaused:
      return (
        <>
          <div className={styles.playbackButton} onClick={this.togglePlaybackPaused}>
            <MaterialIcon icon="play_arrow" />
            {' Resume'}
          </div>
          <div onClick={this.stopPlayback}>
            <MaterialIcon icon="stop" />
            {' Stop playback'}
          </div>
        </>
      );
    default:
      return (
        <div>
          <MaterialIcon className={styles.cameraIcon} icon="videocam" />
        </div>
      );
    }
  }

  get popover() {
    const { fileList } = this.props;
    const {
      filenamePlayback, filenameRecording, forceTime, shouldOutputFrames, loopPlayback,
      useTextFormat, outputFramerate
    } = this.state;

    const options = Object.values(fileList)
      .map((fname) => ({ value: fname, label: fname }));

    const fileNameLabel = <span>Name of recording</span>;
    const fpsLabel = <span>FPS</span>;
    const textFormatLabel = <span>Text file format</span>;

    return (
      <Popover
        className={Picker.Popover}
        closeCallback={this.togglePopover}
        title="Record session"
        attached
        detachable
      >
        <div className={Popover.styles.content}>
          <Checkbox
            checked={useTextFormat}
            label={textFormatLabel}
            setChecked={this.setUseTextFormat}
          />
          <Row>
            <Input
              value={filenameRecording}
              label={fileNameLabel}
              placeholder="Enter recording filename..."
              onChange={(evt) => this.updateRecordingFilename(evt)}
            />

            <div className={Popover.styles.row}>
              <Button
                onClick={this.toggleRecording}
                title="Start Recording"
                style={{ width: 90 }}
                disabled={!filenameRecording}
              >
                <MaterialIcon icon="fiber_manual_record" />
                <span style={{ marginLeft: 5 }}>Record</span>
              </Button>
            </div>
          </Row>
        </div>
        <hr className={Popover.styles.delimiter} />
        <div className={Popover.styles.title}>Play session</div>
        <div className={Popover.styles.content}>
          <Checkbox
            checked={forceTime}
            name="forceTimeInput"
            label="Force time change to recorded time"
            setChecked={this.setForceTiming}
          />
          <Checkbox
            checked={loopPlayback}
            name="loopPlaybackInput"
            label="Loop playback"
            setChecked={this.setLoopPlayback}
          />
          <Row className={styles.lastRow}>
            <Checkbox
              checked={shouldOutputFrames}
              name="outputFramesInput"
              label="Output frames"
              className={styles.fpsCheckbox}
              setChecked={this.setShouldOutputFrames}
            />
            <InfoBox
              className={styles.infoBox}
              text={`If checked, the specified number of frames will be recorded as screenshots and
                saved to disk. Per default, they are saved in the user/screenshots folder. 
                This feature can not be used together with 'loop playback'`}
            />
            { shouldOutputFrames && (
              <Input
                value={outputFramerate}
                label={fpsLabel}
                placeholder="framerate"
                className={styles.fpsInput}
                visible={shouldOutputFrames}
                onChange={(evt) => this.updateOutputFramerate(evt)}
              />
            )}
          </Row>
          <Row>
            <Select
              menuPlacement="top"
              label="Playback file"
              placeholder="Select playback file..."
              onChange={this.setPlaybackFile}
              options={options}
              value={filenamePlayback}
            />
            <div className={Popover.styles.row}>
              <Button
                onClick={this.togglePlayback}
                title="Start Playback"
                block
                small
                transparent={false}
                style={{ width: 90 }}
                disabled={!filenamePlayback}
              >
                <MaterialIcon icon="play_arrow" />
                <span style={{ marginLeft: 5 }}>Play</span>
              </Button>
            </div>
          </Row>
        </div>
      </Popover>
    );
  }

  setPlaybackFile({ value }) {
    this.setState({ filenamePlayback: value });
  }

  updateRecordingFilename(evt) {
    this.setState({ filenameRecording: evt.target.value });
  }

  updateOutputFramerate(evt) {
    this.setState({
      outputFramerate: evt.target.value
    });
  }

  toggleRecording() {
    if (this.isIdle) {
      this.startRecording();
    } else {
      this.props.stopRecording();
    }
  }

  startRecording() {
    const { useTextFormat, filenameRecording } = this.state;
    if (useTextFormat) {
      this.props.startRecordingAscii(filenameRecording);
    } else {
      this.props.startRecordingBinary(filenameRecording);
    }
  }

  stopPlayback() {
    this.props.stopPlayback();
  }

  togglePlaybackPaused() {
    this.props.togglePlaybackPaused();
  }

  togglePlayback() {
    if (this.isIdle) {
      this.startPlayback();
    } else {
      this.props.stopPlayback();
    }
  }

  startPlayback() {
    const {
      forceTime,
      filenamePlayback,
      shouldOutputFrames,
      outputFramerate,
      loopPlayback
    } = this.state;

    this.props.startPlaybackLua(
      filenamePlayback,
      forceTime,
      shouldOutputFrames,
      outputFramerate,
      loopPlayback
    );
  }

  setUseTextFormat(useTextFormat, event) {
    this.setState({ useTextFormat });
  }

  setForceTiming(forceTime, event) {
    this.setState({ forceTime });
  }

  setLoopPlayback(loopPlayback, event) {
    if (loopPlayback) {
      this.setState({ loopPlayback: true, shouldOutputFrames: false });
    } else {
      this.setState({ loopPlayback });
    }
  }

  setShouldOutputFrames(shouldOutputFrames, event) {
    if (shouldOutputFrames) {
      this.setState({ loopPlayback: false, shouldOutputFrames: true });
    } else {
      this.setState({ shouldOutputFrames });
    }
  }

  togglePopover() {
    const { showPopover } = this.state;
    if (!showPopover) {
      this.props.refreshPlaybackFilesList();
    }
    this.setState({ showPopover: !showPopover });
  }

  render() {
    const { engineMode } = this.props;
    const { showPopover } = this.state;

    const enabled = (engineMode === EngineModeUserControl);

    const shouldShowPopover = enabled && showPopover && this.isIdle;

    return (
      <div className={Picker.Wrapper}>
        { this.picker }
        { shouldShowPopover && this.popover }
      </div>
    );
  }
}

const mapSubStateToProps = ({ engineMode, sessionRecording, luaApi }) => {
  const fileList = sessionRecording.files || [];
  const recordingState = sessionRecording.recordingState || SessionStateIdle;
  const mode = engineMode.mode || EngineModeUserControl;

  return {
    engineMode: mode,
    fileList,
    recordingState,
    startRecordingAscii: (filename) => {
      luaApi.sessionRecording.startRecordingAscii(filename);
    },
    startRecordingBinary: (filename) => {
      luaApi.sessionRecording.startRecording(filename);
    },
    stopRecording: () => {
      luaApi.sessionRecording.stopRecording();
    },
    startPlaybackLua: (filename, forceTime, shouldOutputFrames, outputFramerate, loopPlayback) => {
      if (shouldOutputFrames) {
        luaApi.sessionRecording.enableTakeScreenShotDuringPlayback(parseInt(outputFramerate));
      }
      if (forceTime) {
        luaApi.sessionRecording.startPlayback(filename, loopPlayback);
      } else {
        luaApi.sessionRecording.startPlaybackRecordedTime(filename, loopPlayback);
      }
    },
    stopPlayback: () => {
      luaApi.sessionRecording.stopPlayback();
    },
    togglePlaybackPaused: () => {
      luaApi.sessionRecording.togglePlaybackPause();
    }
  };
};

const mapStateToSubState = (state) => ({
  engineMode: state.engineMode,
  sessionRecording: state.sessionRecording,
  originPickerPopover: state.local.popovers.sessionRecording,
  luaApi: state.luaApi
});

const mapDispatchToProps = (dispatch) => ({
  subscribe: () => {
    dispatch(subscribeToSessionRecording());
    dispatch(subscribeToEngineMode());
  },
  unsubscribe: () => {
    dispatch(unsubscribeToSessionRecording());
  },
  refreshPlaybackFilesList: () => {
    dispatch(refreshSessionRecording());
    dispatch(unsubscribeToEngineMode());
  }
});

SessionRec = connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(SessionRec);

export default SessionRec;
