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
import WWTPanel from './WWTPanel';

const BottomBar = ({ showFlightController }) => (
  <div className={styles.BottomBar}>
    <OriginPicker />
    <TimePicker />
    <SessionRec />
    <ScreenSpaceRenderablePanel />
    <ExoplanetsPanel />
    <ActionsPanel />
    {showFlightController && <FlightControlPanel />}
    <WWTPanel />
  </div>
);

BottomBar.propTypes = {
  showFlightController: PropTypes.bool,
};

BottomBar.defaultProps = {
  showFlightController: false,
};

export default BottomBar;
