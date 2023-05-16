import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  subscribeToProperty,
  unsubscribeToProperty
} from '../../api/Actions';
import { ExoplanetsModuleEnabledKey, SkyBrowserModuleEnabledKey } from '../../api/keys';
import { getBoolPropertyValue } from '../../utils/propertyTreeHelpers';
import ActionsPanel from './ActionsPanel';
import styles from './BottomBar.scss';
import ExoplanetsPanel from './ExoplanetsPanel';
import FlightControlPanel from './FlightControlPanel';
import OriginPicker from './Origin/OriginPicker';
import ScreenSpaceRenderablePanel from './ScreenSpaceRenderablePanel';
import SessionRec from './SessionRec';
import TimePicker from './TimePicker';
import SkyBrowserPanel from './SkyBrowserPanel';
import GeoPositionPanel from './GeoPositionPanel';
import Missions from './Missions/Missions';

export default function BottomBar({
  showFlightController
}) {
  const showExoplanets = useSelector((state) => getBoolPropertyValue(state, ExoplanetsModuleEnabledKey));
  const showSkyBrowser = useSelector((state) => getBoolPropertyValue(state, SkyBrowserModuleEnabledKey));
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
      <ActionsPanel />
      {showFlightController && <FlightControlPanel />}
      {showSkyBrowser && <SkyBrowserPanel />}
      {showMissions && <Missions />}
    </div>
  );
}

BottomBar.propTypes = {
  showExoplanets: PropTypes.bool,
  showFlightController: PropTypes.bool,
  showSkyBrowser: PropTypes.bool
};

BottomBar.defaultProps = {
  showExoplanets: false,
  showFlightController: false,
  showSkyBrowser: false
};
