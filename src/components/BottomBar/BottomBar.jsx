import React from 'react';

import OriginPicker from './Origin/OriginPicker';
import TimePicker from './TimePicker';
import TfEditor from './TfEditor/containers/TfEditor';
import styles from './BottomBar.scss';


//    <TfEditor />

const BottomBar = () => (
  <div className={styles.BottomBar}>
    <OriginPicker />
    <TimePicker />
  </div>
);

export default BottomBar;
