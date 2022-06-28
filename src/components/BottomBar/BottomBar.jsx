import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  subscribeToProperty,
  unsubscribeToProperty,
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

let BottomBar = ({
  showExoplanets,
  showFlightController,
  showSkyBrowser,
  startListening,
  stopListening
}) => {

  useEffect(() => {
    // componentDidMount
    startListening();

    return () => { // componentWillUnmount
      stopListening();
    }
  });

  return <div className={styles.BottomBar}>
    <OriginPicker />
    <TimePicker />
    <SessionRec />
    <ScreenSpaceRenderablePanel />
    {showExoplanets && <ExoplanetsPanel />}
    <ActionsPanel />
    {showFlightController && <FlightControlPanel />}
    {showSkyBrowser && <SkyBrowserPanel />}
  </div>
};

BottomBar.propTypes = {
  showExoplanets: PropTypes.bool,
  showFlightController: PropTypes.bool,
  showSkyBrowser: PropTypes.bool,
};

BottomBar.defaultProps = {
  showExoplanets: false,
  showFlightController: false,
  showSkyBrowser: false,
};

const mapStateToProps = (state) => {
  return {
    showExoplanets: getBoolPropertyValue(state, ExoplanetsModuleEnabledKey),
    showSkyBrowser: getBoolPropertyValue(state, SkyBrowserModuleEnabledKey)
  }
};

const mapDispatchToProps = dispatch => ({
  startListening: () => {
    dispatch(subscribeToProperty(ExoplanetsModuleEnabledKey));
    dispatch(subscribeToProperty(SkyBrowserModuleEnabledKey));
  },
  stopListening: () => {
    dispatch(unsubscribeToProperty(ExoplanetsModuleEnabledKey));
    dispatch(unsubscribeToProperty(SkyBrowserModuleEnabledKey));
  },
})

BottomBar = connect(mapStateToProps, mapDispatchToProps)(BottomBar);

export default BottomBar;
