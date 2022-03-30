import React from 'react';
import ActionsPanel from './ActionsPanel';
import styles from './BottomBar.scss';
import ExoplanetsPanel from './ExoplanetsPanel';
import FlightControlPanel from './FlightControlPanel';
import OriginPicker from './Origin/OriginPicker';
import ScreenSpaceRenderablePanel from './ScreenSpaceRenderablePanel';
import SessionRec from './SessionRec';
import TimePicker from './TimePicker';
import ClimatePanel from './ClimatePanel';
import Slider from './Slider';

const BottomBar = (props) => (
  <div className={styles.BottomBar}>
    <ClimatePanel />
    <OriginPicker />

    <TimePicker />
    <SessionRec />
    <ScreenSpaceRenderablePanel />
    <ExoplanetsPanel />
    <ActionsPanel />
    <Slider />
    {props.showFlightController && <FlightControlPanel />}
  </div>
);

export default BottomBar;
