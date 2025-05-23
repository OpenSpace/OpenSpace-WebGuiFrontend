import React from 'react';
import {
  MdFiberManualRecord, MdPause, MdPlayArrow, MdStop, MdVideocam
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

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
import HorizontalDelimiter from '../common/HorizontalDelimiter/HorizontalDelimiter';
import InfoBox from '../common/InfoBox/InfoBox';
import Button from '../common/Input/Button/Button';
import Checkbox from '../common/Input/Checkbox/Checkbox';
import Input from '../common/Input/Input/Input';
import Select from '../common/Input/Select/Select';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';

import Picker from './Picker';

import styles from './SessionRec.scss';

function SessionRec() {
  const [useTextFormat, setUseTextFormat] = React.useState(false);
  const [filenameRecording, setFilenameRecording] = React.useState('');
  const [filenamePlayback, setFilenamePlayback] = React.useState(undefined);
  const [shouldOutputFrames, setShouldOutputFrames] = React.useState(false);
  const [outputFramerate, setOutputFramerate] = React.useState(60);
  const [loopPlayback, setLoopPlayback] = React.useState(false);
  const [showPopover, setShowPopover] = React.useState(false);

  const luaApi = useSelector((state) => state.luaApi);

  const fileList = useSelector((state) => state.sessionRecording.files || []);
  const recordingState = useSelector((state) => (
    state.sessionRecording.recordingState || SessionStateIdle
  ));
  const engineMode = useSelector((state) => state.engineMode.mode || EngineModeUserControl);

  const dispatch = useDispatch();

  function subscribe() {
    dispatch(subscribeToSessionRecording());
    dispatch(subscribeToEngineMode());
  }

  function unsubscribe() {
    dispatch(unsubscribeToSessionRecording());
  }

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
      luaApi.sessionRecording.startRecording();
  }

  function toggleRecording() {
    if (isIdle()) {
      startRecording();
    } else {
      const format = useTextFormat ? "Ascii" : "Binary";
      luaApi.absPath("${RECORDINGS}/" + filenameRecording).then(
        (value) => luaApi.sessionRecording.stopRecording(value[1], format)
      );
    }
  }

  function startPlayback() {
    const ShouldWaitForTiles = true;
    luaApi.absPath("${RECORDINGS}/" + filenamePlayback).then(function(value) {
      if (shouldOutputFrames) {
        const framerate = parseInt(outputFramerate, 10)
        luaApi.sessionRecording.startPlayback(
          value[1], loopPlayback, ShouldWaitForTiles, framerate
        );
      }
      else {
        luaApi.sessionRecording.startPlayback(value[1], loopPlayback, ShouldWaitForTiles);
      }
    });
  }

  function stopPlayback() {
    luaApi.sessionRecording.stopPlayback();
  }

  function togglePlayback() {
    if (isIdle()) {
      startPlayback();
    } else {
      stopPlayback();
    }
  }

  function togglePlaybackPaused() {
    luaApi.sessionRecording.togglePlaybackPause();
  }

  function refreshPlaybackFilesList() {
    dispatch(refreshSessionRecording());
    dispatch(unsubscribeToEngineMode());
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
            <MdVideocam alt="videocam" />
            {' Stop recording'}
          </div>
        );
      case SessionStatePlaying:
        return (
          <>
            <Button
              className={styles.playbackButton}
              onClick={togglePlaybackPaused}
            >
              <MdPause alt="pause" />
              {' Pause'}
            </Button>
            <Button onClick={stopPlayback}>
              <MdStop alt="stop" />
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
              <MdPlayArrow alt="resume" />
              {' Resume'}
            </Button>
            <Button
              onClick={stopPlayback}
              regular
            >
              <MdStop alt="stop" />
              {' Stop playback'}
            </Button>
          </>
        );
      default:
        return (
          <div>
            <MdVideocam className={Picker.Icon} alt="videocam" />
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
                <MdFiberManualRecord alt="record" />
                <span style={{ marginLeft: 5 }}>Record</span>
              </Button>
            </div>
          </Row>
        </div>
        <HorizontalDelimiter />
        <div className={Popover.styles.title}>Play session</div>
        <div className={Popover.styles.content}>
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
                <MdPlayArrow alt="resume" />
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

export default SessionRec;
