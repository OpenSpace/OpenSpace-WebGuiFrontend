import React from 'react';

import Envelope from '../containers/Envelope';
import Histogram from '../containers/Histogram';

import styles from '../style/EditorCanvas.scss';

function EditorContainer({
  height,
  width,
  activeVolume,
  URI
}) {
  return (
    <div className={styles.EditorContainer}>
      <div className={styles.EnvelopeContainer}>
        <Envelope
          height={height}
          width={width}
          activeVolume={activeVolume}
          URI={URI}
        />
      </div>
      <div className={styles.HistogramContainer}>
        <Histogram height={height} width={width} activeVolume={activeVolume} />
      </div>
    </div>
  );
}

export default EditorContainer;
