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
import ClimatePanel from './ClimatePanel';
import Slider from './Slider';

const BottomBar = ({ showFlightController }) => (
  <div className={styles.BottomBar}>
    <ClimatePanel />
    <OriginPicker />

    <TimePicker />
    <SessionRec />
    <ScreenSpaceRenderablePanel />
    <ExoplanetsPanel />
    <ActionsPanel />
    <Slider />
    {showFlightController && <FlightControlPanel />}
  </div>
);

BottomBar.propTypes = {
  showFlightController: PropTypes.bool,
};

BottomBar.defaultProps = {
  showFlightController: false,
};

export default BottomBar;
