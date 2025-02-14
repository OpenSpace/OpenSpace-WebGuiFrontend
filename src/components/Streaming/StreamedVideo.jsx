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
    <>
    <div className={styles.stream}>
      <video playsInline id="remote-video" autoPlay></video>
    </div>
      <script>
        const video = document.querySelector('remote-video');
        video.addEventListener('loadedmetadata', () => {console.log('Video metadata loaded')};
        );
        video.addEventListener('error', (e) => console.error('Video error:', e));
         video.addEventListener('stalled', () => console.warn('Video stalled'));
        video.addEventListener('playing', () => console.log('Video is playing'));
      </script>
    </>
  )
}

export default StreamedVideo;