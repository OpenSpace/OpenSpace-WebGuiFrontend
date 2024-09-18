/**********************************************************
OpenSpace Streaming Thesis (2022)
----------------------------------------------
This component is basically the same as the BottomBar
component, with the StreamingMenu component added, and menu
items that access the host's computer removed for security
reasons
**********************************************************/

import React from 'react';
import PropTypes from 'prop-types';
import styles from './../BottomBar/BottomBar.scss'
import OriginPicker from '../BottomBar/Origin/OriginPicker';
import ScreenSpaceRenderablePanel from '../BottomBar/ScreenSpaceRenderablePanel';
import TimePicker from '../BottomBar/TimePicker';
import FlightSettings from './FlightSettings';
import StreamingMenu from './StreamingMenu';

const StreamingBottomBar = ({ showFlightSettings }) => (
  <div className={styles.BottomBar}>
    <OriginPicker />
    <TimePicker />
    <StreamingMenu/>
    <ScreenSpaceRenderablePanel />
    {showFlightSettings && <FlightSettings/>}
  </div>
);

StreamingBottomBar.propTypes = {
  showFlightSettings: PropTypes.bool,
};

StreamingBottomBar.defaultProps = {
  showFlightSettings: false,
};

export default StreamingBottomBar;