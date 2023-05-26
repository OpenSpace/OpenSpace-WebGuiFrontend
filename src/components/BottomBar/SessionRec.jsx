import React from 'react';
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
import InfoBox from '../common/InfoBox/InfoBox';
import Button from '../common/Input/Button/Button';
import Checkbox from '../common/Input/Checkbox/Checkbox';
import Input from '../common/Input/Input/Input';
import Select from '../common/Input/Select/Select';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';

import Picker from './Picker';

import styles from './SessionRec.scss';

function SessionRec({
  recordingState, engineMode, fileList, refreshPlaybackFilesList,
  subscribe, unsubscribe, stopRecording, stopPlayback, startRecordingAscii, startRecordingBinary,
  togglePlaybackPaused, startPlaybackLua
}) {
  const [useTextFormat, setUseTextFormat] = React.useState(false);
  const [forceTime, setForceTime] = React.useState(true);
  const [filenameRecording, setFilenameRecording] = React.useState('');
  const [filenamePlayback, setFilenamePlayback] = React.useState(undefined);
  const [shouldOutputFrames, setShouldOutputFrames] = React.useState(false);
  const [outputFramerate, setOutputFramerate] = React.useState(60);
  const [loopPlayback, setLoopPlayback] = React.useState(false);
  const [showPopover, setShowPopover] = React.useState(false);

  React.useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, []);

  function isIdle() {
    return (recordingState === SessionStateIdle);
  }

  function onLoopPlaybackChange(newLoopPlayback) {
    if (newLoopPlayback) {
      setLoopPlayback(true);
      setShouldOutputFrames(false);
    } else {
      setLoopPlayback(newLoopPlayback);
    }
  }

  function onShouldUpdateFramesChange(newValue) {
    if (newValue) {
      setLoopPlayback(false);
      setShouldOutputFrames(true);
    } else {
      setShouldOutputFrames(newValue);
    }
  }

  function setPlaybackFile({ value }) {
    setFilenamePlayback(value);
  }

  function updateRecordingFilename(evt) {
    setFilenameRecording(evt.target.value);
  }

  function updateOutputFramerate(evt) {
    setOutputFramerate(evt.target.value);
  }

  function startRecording() {
    if (useTextFormat) {
      startRecordingAscii(filenameRecording);
    } else {
      startRecordingBinary(filenameRecording);
    }
  }

  function toggleRecording() {
    if (isIdle()) {
      startRecording();
    } else {
      stopRecording();
    }
  }

  function startPlayback() {
    startPlaybackLua(
      filenamePlayback,
      forceTime,
      shouldOutputFrames,
      outputFramerate,
      loopPlayback
    );
  }

  function togglePlayback() {
    if (isIdle()) {
      startPlayback();
    } else {
      stopPlayback();
    }
  }

  function togglePopover() {
    if (!showPopover) {
      refreshPlaybackFilesList();
    }
    setShowPopover((current) => !current);
  }

  function pickerContent() {
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
            <Button
              className={styles.playbackButton}
              onClick={togglePlaybackPaused}
              regular
            >
              <MaterialIcon icon="pause" />
              {' Pause'}
            </Button>
            <Button onClick={stopPlayback} regular>
              <MaterialIcon icon="stop" />
              {' Stop playback'}
            </Button>
          </>
        );
      case SessionStatePaused:
        return (
          <>
            <Button
              className={styles.playbackButton}
              onClick={togglePlaybackPaused}
              regular
            >
              <MaterialIcon icon="play_arrow" />
              {' Resume'}
            </Button>
            <Button
              onClick={stopPlayback}
              regular
            >
              <MaterialIcon icon="stop" />
              {' Stop playback'}
            </Button>
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

  function picker() {
    const classes = [];
    let onClick = togglePopover;

    // The picker works and looks differently depending on the
    // different states and modes
    if (engineMode === EngineModeCameraPath) {
      classes.push(Picker.DisabledBlue);
      onClick = undefined;
    } else if (recordingState === SessionStateRecording) {
      classes.push(Picker.Red);
      onClick = toggleRecording;
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
        { pickerContent() }
      </Picker>
    );
  }

  function popover() {
    const options = Object.values(fileList)
      .map((fname) => ({ value: fname, label: fname }));

    const fileNameLabel = <span>Name of recording</span>;
    const fpsLabel = <span>FPS</span>;
    const textFormatLabel = <span>Text file format</span>;

    return (
      <Popover
        className={Picker.Popover}
        closeCallback={togglePopover}
        title="Record session"
        attached
        detachable
      >
        <div className={Popover.styles.content}>
          <Checkbox
            checked={useTextFormat}
            setChecked={setUseTextFormat}
          >
            <p>{textFormatLabel}</p>
          </Checkbox>
          <Row>
            <Input
              value={filenameRecording}
              label={fileNameLabel}
              placeholder="Enter recording filename..."
              onChange={(evt) => updateRecordingFilename(evt)}
            />

            <div className={Popover.styles.row}>
              <Button
                onClick={toggleRecording}
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
            setChecked={setForceTime}
          >
            <p>Force time change to recorded time</p>
          </Checkbox>
          <Checkbox
            checked={loopPlayback}
            name="loopPlaybackInput"
            setChecked={onLoopPlaybackChange}
          >
            <p>Loop playback</p>
          </Checkbox>
          <Row className={styles.lastRow}>
            <Checkbox
              checked={shouldOutputFrames}
              name="outputFramesInput"
              className={styles.fpsCheckbox}
              setChecked={onShouldUpdateFramesChange}
            >
              <p>Output frames</p>
              <InfoBox
                className={styles.infoBox}
                text={`If checked, the specified number of frames will be recorded as 
                screenshots and saved to disk. Per default, they are saved in the  
                user/screenshots folder. This feature can not be used together with
                'loop playback'`}
              />
            </Checkbox>
            {shouldOutputFrames && (
              <Input
                value={outputFramerate}
                label={fpsLabel}
                placeholder="framerate"
                className={styles.fpsInput}
                visible={shouldOutputFrames ? 'visible' : 'hidden'}
                onChange={(evt) => updateOutputFramerate(evt)}
              />
            )}
          </Row>
          <Row>
            <Select
              menuPlacement="top"
              label="Playback file"
              placeholder="Select playback file..."
              onChange={setPlaybackFile}
              options={options}
              value={filenamePlayback}
            />
            <div className={Popover.styles.row}>
              <Button
                onClick={togglePlayback}
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

  const shouldShowPopover = (engineMode === EngineModeUserControl) && showPopover && isIdle();
  return (
    <div className={Picker.Wrapper}>
      { picker() }
      { shouldShowPopover && popover() }
    </div>
  );
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
        luaApi.sessionRecording.enableTakeScreenShotDuringPlayback(parseInt(outputFramerate, 10));
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

export default connect(
  subStateToProps(mapSubStateToProps, mapStateToSubState),
  mapDispatchToProps,
)(SessionRec);
