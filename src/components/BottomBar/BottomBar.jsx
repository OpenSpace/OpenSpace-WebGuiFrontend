import React from 'react';

import OriginPicker from './Origin/OriginPicker';
import TimePicker from './TimePicker';
import TfEditor from './TfEditor/containers/TfEditor';
import SessionRec from './SessionRec';
import ScreenSpaceRenderablePanel from './ScreenSpaceRenderablePanel';
import styles from './BottomBar.scss';
import ExoplanetsPanel from './ExoplanetsPanel';
import WWTPanel from './WWTPanel';

const BottomBar = (props) => (
  <div className={styles.BottomBar}>
    <OriginPicker />
    <TimePicker />
    <SessionRec />
    <ScreenSpaceRenderablePanel />
    <ExoplanetsPanel />
    <WWTPanel />
  </div>
);

export default BottomBar;
