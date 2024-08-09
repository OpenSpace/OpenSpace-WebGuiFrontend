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
import ActionsPanel from './ActionsPanel';
import ExoplanetsPanel from './ExoplanetsPanel';
import FlightControlPanel from './FlightControlPanel';
import GeoPositionPanel from './GeoPositionPanel';
import ScreenSpaceRenderablePanel from './ScreenSpaceRenderablePanel';
import SessionRec from './SessionRec';
import SkyBrowserPanel from './SkyBrowserPanel';
import FlightSettings from './FlightSettings';

const BottomBar = (props) => (
  <div className={styles.BottomBar}>
    <OriginPicker />
    <TimePicker />
    <SessionRec />
    <ScreenSpaceRenderablePanel />
    <ExoplanetsPanel />
    <ActionsPanel />
    {props.showFlightController && <FlightControlPanel />}
    <SkyBrowserPanel />
  </div>
);

BottomBar.propTypes = {
  showFlightController: PropTypes.bool
};

BottomBar.defaultProps = {
  showFlightController: false
};
