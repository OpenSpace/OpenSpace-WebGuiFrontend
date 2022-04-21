import React from 'react';
import PropTypes from 'prop-types';
import ActionsPanel from './ActionsPanel';
import styles from './BottomBar.scss';
import ExoplanetsPanel from './ExoplanetsPanel';
import FlightControlPanel from './FlightControlPanel';
import OriginPicker from './Origin/OriginPicker';
import ScreenSpaceRenderablePanel from './ScreenSpaceRenderablePanel';
import SessionRec from './SessionRec';
import TimePicker from './TimePicker';
import SkyBrowserPanel from './SkyBrowserPanel';
import FlightSettings from './FlightSettings';
import StreamingMenu from './StreamingMenu';

const StreamingBottomBar = (props) => (
  <div className={styles.BottomBar}>
    <OriginPicker />
    <TimePicker />
    <StreamingMenu/>
    <ScreenSpaceRenderablePanel />
    <ExoplanetsPanel />
    {props.showFlightSettings && <FlightSettings/>}
  </div>
);

StreamingBottomBar.propTypes = {
  showFlightController: PropTypes.bool,
};

StreamingBottomBar.defaultProps = {
  showFlightController: false,
};

export default StreamingBottomBar;
