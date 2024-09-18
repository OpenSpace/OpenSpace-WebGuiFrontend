/**********************************************************
OpenSpace Streaming Thesis (2022)
----------------------------------------------
This component contains the incoming video feed that has 
been streamed from OpenSpace
**********************************************************/


import React from 'react';
import styles from  './StreamedVideo.scss';

function StreamedVideo() {
  return (
    <div className={styles.stream}>
      <video playsInline id="remote-video" autoPlay></video>
    </div>
  )
}

export default StreamedVideo;