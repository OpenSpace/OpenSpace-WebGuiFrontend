import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import {
  subscribeToProperty,
  unsubscribeToProperty
} from '../../api/Actions';
import { ExoplanetsModuleEnabledKey, SkyBrowserModuleEnabledKey } from '../../api/keys';
import { getBoolPropertyValue } from '../../utils/propertyTreeHelpers';

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

export default function BottomBar({
  showFlightController
}) {
  const showExoplanets = useSelector(
    (state) => getBoolPropertyValue(state, ExoplanetsModuleEnabledKey)
  );
  const showSkyBrowser = useSelector(
    (state) => getBoolPropertyValue(state, SkyBrowserModuleEnabledKey)
  );
  const missions = useSelector((state) => state.missions);
  const showMissions = missions?.isInitialized && missions?.data?.missions;

  const dispatch = useDispatch();

  // Subscribe to exoplanets
  useEffect(() => {
    // componentDidMount
    dispatch(subscribeToProperty(ExoplanetsModuleEnabledKey));
    return () => { // componentWillUnmount
      dispatch(unsubscribeToProperty(ExoplanetsModuleEnabledKey));
    };
  }, []);

  // Subscribe to skybrowser
  useEffect(() => {
    dispatch(subscribeToProperty(SkyBrowserModuleEnabledKey));
    return () => {
      dispatch(unsubscribeToProperty(SkyBrowserModuleEnabledKey));
    };
  }, []);

  return (
    <div className={styles.BottomBar}>
      <OriginPicker />
      <TimePicker />
      <SessionRec />
      <GeoPositionPanel />
      <ScreenSpaceRenderablePanel />
      {showExoplanets && <ExoplanetsPanel />}
      <UserControlPanel />
      <ActionsPanel />
      {showFlightController && <FlightControlPanel />}
      {showSkyBrowser && <SkyBrowserPanel />}
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
