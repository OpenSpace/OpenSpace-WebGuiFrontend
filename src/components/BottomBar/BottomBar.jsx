import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import Missions from './Missions/Missions';
import OriginPicker from './Origin/OriginPicker';
import UserControlPanel from './UserControlPanel/UserControlPanel';
import ActionsPanel from './ActionsPanel';
import ExoplanetsPanel from './ExoplanetsPanel';
import FlightControlPanel from './FlightControlPanel';
import GeoPositionPanel from './GeoPositionPanel';
import ScreenSpaceRenderablePanel from './ScreenSpaceRenderablePanel';
import SessionRec from './SessionRec';
import SkyBrowserPanel from './SkyBrowserPanel';
import TimePicker from './TimePicker';

import styles from './BottomBar.scss';

export default function BottomBar({ showFlightController }) {
  const missions = useSelector((state) => state.missions);
  const showMissions = missions?.isInitialized && missions?.data?.missions;

  return (
    <div className={styles.BottomBar}>
      <OriginPicker />
      <TimePicker />
      <SessionRec />
      <GeoPositionPanel />
      <ScreenSpaceRenderablePanel />
      <ExoplanetsPanel />
      <UserControlPanel />
      <ActionsPanel />
      {showFlightController && <FlightControlPanel />}
      <SkyBrowserPanel />
      {showMissions && <Missions />}
    </div>
  );
}

BottomBar.propTypes = {
  showFlightController: PropTypes.bool
};

BottomBar.defaultProps = {
  showFlightController: false
};
