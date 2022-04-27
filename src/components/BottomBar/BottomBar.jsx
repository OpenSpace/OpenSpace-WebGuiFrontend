import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { 
  subscribeToProperty,
  unsubscribeToProperty,
} from '../../api/Actions';
import { ExoplanetsModuleEnabledKey } from '../../api/keys';
import { getEnabledPropertyValue } from '../../utils/propertyTreeHelpers';
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
  startListening,
  stopListening
}) => {

  useEffect(() => {
    // componentDidMount
    startListening(ExoplanetsModuleEnabledKey);

    return () => { // componentWillUnmount
      stopListening(ExoplanetsModuleEnabledKey);
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
    <SkyBrowserPanel />
  </div>
};

BottomBar.propTypes = {
  showFlightController: PropTypes.bool,
  showExoplanets: PropTypes.bool,
};

BottomBar.defaultProps = {
  showFlightController: false,
  showExoplanets: false,
};

const mapStateToProps = (state) => {
  return {
    showExoplanets: getEnabledPropertyValue(state, ExoplanetsModuleEnabledKey)
  }
};

const mapDispatchToProps = dispatch => ({
  startListening: (uri) => {
    dispatch(subscribeToProperty(uri));
  },
  stopListening: (uri) => {
    dispatch(unsubscribeToProperty(uri));
  },
})

BottomBar = connect(mapStateToProps, mapDispatchToProps)(BottomBar);

export default BottomBar;
