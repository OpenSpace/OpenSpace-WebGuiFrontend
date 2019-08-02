import React from 'react';

import OriginPicker from './Origin/OriginPicker';
import TimePicker from './TimePicker';
import TfEditor from './TfEditor/containers/TfEditor';
import SessionRec from './SessionRec';
import ScreenSpaceRenderablePanel from './ScreenSpaceRenderablePanel';
import styles from './BottomBar.scss';

// <TfEditor /> is currently disabled.

const BottomBar = () => (
  <div className={styles.BottomBar}>
    <OriginPicker />
    <TimePicker />
    <SessionRec />
    <ScreenSpaceRenderablePanel />
  </div>
);

export default BottomBar;
