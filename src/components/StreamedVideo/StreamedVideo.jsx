import React, { Component } from 'react';
import styles from  './StreamedVideo.scss';

class StreamedVideo extends Component {
  constructor(props) {
    super(props);
  }


  // Render function
  render() {
    return (
      <div className={styles.stream}>
        <video playsInline id="remote-video" autoPlay></video>
      </div>
    )
  }
}

export default StreamedVideo;
