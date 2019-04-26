import React, { Component } from 'react';
import { throttle } from 'lodash/function';
import DataManager, { TopicTypes } from '../../api/DataManager';
import { DeltaTime, ValuePlaceholder, SetDeltaTimeScript, InterpolateDeltaTimeScript } from '../../api/keys';
import NumericInput from '../common/Input/NumericInput/NumericInput';
import Row from '../common/Row/Row';
import Select from '../common/Input/Select/Select';
import { round10 } from '../../utils/rounding';
import ScaleInput from '../common/Input/ScaleInput/ScaleInput';


class PlaybackFiles extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playbackFile: '',
      fileList: ''
    };

    this.setPlaybackFile = this.setPlaybackFile.bind(this);
    this.playbackListCallback = this.playbackListCallback.bind(this);
    this.refreshPlaybackFilesList = this.refreshPlaybackFilesList.bind(this);
  }

  componentDidMount() {
    this.refreshPlaybackFilesList();
  }

  componentWillUnmount() {
  }

  get playbackFile() {
    const { playbackFile } = this.state;
    return playbackFile;
  }

  setPlaybackFile({ value }) {
    this.setState({ playbackFile: value });
  }

  refreshPlaybackFilesList() {
    //When clicking to display sessionRecording menu, trigger openspace to
    // read its recording directory and provide a list of available playback
    // files (which will go to the specified callback file)
    this.state.playbackListSubscriptionId = DataManager
      .getValue('playbackList', this.playbackListCallback);
    //this.setState({ playbackFile: value });
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

  render() {
    const { playbackFile } = this.state;

    //Trying to add filenames here
    //var flLength = this.state.fileList.length;
    //for (var i = 0; i < flLength; i++) {
    //  let f = this.state.fileList[i];
    //  Steps.this.f = f;
    //}

    const options = Object.values(this.state.fileList)
      .map(fname => ({ value: fname, label: fname }));

    return (
      <div>
        <Row>
        <Select
            direction="up"
            label="Display unit"
            onChange={this.setPlaybackFile}
            options={options}
            value={playbackFile}
        />
        </Row>
        <div style={{ height: '10px' }} />
      </div>
    );
  }
}

export default PlaybackFiles;
