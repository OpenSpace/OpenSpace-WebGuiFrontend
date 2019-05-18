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

import {
  subscribeToSessionRecording,
  unsubscribeToSessionRecording,
  refreshSessionRecording
} from '../../api/Actions'

import styles from './SessionRec.scss';

class SessionRec extends Component {

  constructor(props) {
    super(props);

    this.state = {
      useTextFormat: false,
      forceTime: true,
      filenameRecording: '',
      filenamePlayback: ''
    };

    this.togglePopover = this.togglePopover.bind(this);
    this.toggleRecording = this.toggleRecording.bind(this);
    this.togglePlayback = this.togglePlayback.bind(this);
    this.setPlaybackFile = this.setPlaybackFile.bind(this);
    this.setForceTiming = this.setForceTiming.bind(this);
    this.setUseTextFormat = this.setUseTextFormat.bind(this);
  }

  componentDidMount() {
    this.props.subscribe();
  }

  componentWillUnmount() {
   this.props.unsubscribe();
  }

  get picker() {
    const classes = [];
    let onClick = this.togglePopover;
    if (this.props.recordingState === sessionStateRecording) {
      classes.push(styles.recordingPicker);
      onClick = this.toggleRecording;
    } else if (this.props.recordingState === sessionStatePlaying) {
      classes.push(styles.playingPicker);
      onClick = this.togglePlayback;
    } else if (this.state.showPopover) {
      classes.push(Picker.Active)
    }
    return <Picker onClick={onClick}
            className={classes.join(' ')}>
          { this.pickerContent }
    </Picker>
  }

  get pickerContent() {
    switch (this.props.recordingState) {
      case sessionStateRecording:
        return <div>
          <MaterialIcon icon="videocam" /> Stop recording
        </div>;
      case sessionStatePlaying:
        return <div>
          <MaterialIcon icon="stop" /> Stop playback
        </div>;
      default:
        return <div>
          <MaterialIcon className={styles.cameraIcon} icon="videocam" />
        </div>;
    }
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
            checked={this.state.useTextFormat}
            label={textFormatLabel}
            setChecked={this.setUseTextFormat}
          />
          <Row>
            <Input value={this.state.filenameRecording}
                   label={fileNameLabel}
                   placeholder={"Enter recording filename..."}
                   onChange={evt => this.updateRecordingFilename(evt)} />

            <div className={Popover.styles.row}>
              <Button onClick={this.toggleRecording}
                      title="Start Recording"
                      style={{width: 90}}>
                <MaterialIcon icon="fiber_manual_record" />
                <span style={{marginLeft: 5}}>Record</span>
              </Button>
            </div>
          </Row>
        </div>
        <hr className={Popover.styles.delimiter} />
        <div className={Popover.styles.title}>Play session</div>
        <div className={Popover.styles.content}>
          <Checkbox
            checked={this.state.forceTime}
            name="forceTimeInput"
            label="Force time change to recorded time"
            setChecked={this.setForceTiming}
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
              <Button onClick={this.togglePlayback} title="Start Playback"
                      block small transparent={false}
                      style={{width: 90}} >
                <MaterialIcon icon="play_arrow" />
                <span style={{marginLeft: 5}}>Play</span>
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
    this.setState({
      filenameRecording: evt.target.value
    });
  }

  toggleRecording() {
    if (this.props.recordingState == sessionStateIdle) {
      this.startRecording();
    } else {
      this.props.stopRecording();
    }
  }

  startRecording () {
    const { useTextFormat, filenameRecording } = this.state;
    if (useTextFormat) {
      this.props.startRecordingAscii(filenameRecording);
    } else {
      this.props.startRecordingBinary(filenameRecording);
    }
  }

  togglePlayback() {
    if (this.props.recordingState === sessionStateIdle) {
      this.startPlayback();
    } else {
      this.props.stopPlayback();
    }
  }

  startPlayback () {
    const { forceTime, filenamePlayback } = this.state;

    if (forceTime) {
      this.props.startPlaybackImmediate(filenamePlayback);
    } else {
      this.props.startPlaybackRecordedTime(filenamePlayback);
    }
  }

  setUseTextFormat(useTextFormat) {
    this.setState({useTextFormat})
  }

  setForceTiming(forceTime) {
    this.setState({forceTime});
  }

  togglePopover() {
    if (!this.state.showPopover) {
      this.props.refreshPlaybackFilesList();
      this.setState({ showPopover: true})
    } else {
      this.setState({ showPopover: false})
    }
  }

  render() {
    return (
      <div className={Picker.Wrapper}>
        { this.picker }
        { this.state.showPopover && this.props.recordingState === sessionStateIdle && this.popover }
      </div>
    );
  }
}

const mapSubStateToProps = ({sessionRecording, sessionRecordingPopover, luaApi}) => {
  const fileList = sessionRecording.files || [];
  const recordingState = sessionRecording.recordingState || sessionStateIdle;

  return {
    fileList,
    recordingState,
    startRecordingAscii: filename => {
      luaApi.sessionRecording.startRecordingAscii(filename);
    },
    startRecordingBinary: filename => {
      luaApi.sessionRecording.startRecording(filename);
    },
    stopRecording: () => {
      luaApi.sessionRecording.stopRecording();
    },
    startPlaybackImmediate: filename => {
      luaApi.sessionRecording.startPlayback(filename);
    },
    startPlaybackRecordedTime: filename => {
      luaApi.sessionRecording.startPlaybackRecordedTime(filename);
    },
    stopPlayback: () => {
      luaApi.sessionRecording.stopPlayback();
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
      dispatch(subscribeToSessionRecording());
    },
    unsubscribe: () => {
      dispatch(unsubscribeToSessionRecording());
    },
    refreshPlaybackFilesList: () => {
      dispatch(refreshSessionRecording());
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
