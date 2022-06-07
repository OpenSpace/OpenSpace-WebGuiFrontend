import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  subscribeToProperty,
  unsubscribeToProperty,
} from '../../api/Actions';
import { ExoplanetsModuleEnabledKey, SkyBrowserModuleEnabledKey } from '../../api/keys';
import { getBoolPropertyValue } from '../../utils/propertyTreeHelpers';

import styles from '../BottomBar/BottomBar.scss';
import HomeButtonContainer from '../TouchBar/UtilitiesMenu/containers/HomeButtonContainer';


import SessionRec from '../BottomBar/SessionRec';
import TimePicker from '../BottomBar/TimePicker';
import ClimatePanel from '../BottomBar/ClimatePanel';
import Slider from '../BottomBar/Slider';
import SkyBrowserPanel from '../BottomBar/SkyBrowserPanel';
import TimePlayerController from '../TouchBar/UtilitiesMenu/presentational/TimePlayerController'
import Instructions from './Instructions/Instructions'

let BottomBar = ({
  showExoplanets,
  showFlightController,
  showSkyBrowser,
  startListening,
  stopListening,
  resetStory,
  setNoShow
}) => {

  useEffect(() => {
    // componentDidMount
    startListening();

    return () => { // componentWillUnmount
      stopListening();
    }
  });

  return <div className={styles.BottomBar}>
    <Instructions/>
    <ClimatePanel  setNoShow = {setNoShow}/>
    <HomeButtonContainer resetStory={resetStory}/>
    <TimePicker />


    {showFlightController && <FlightControlPanel />}

  </div>
};

BottomBar.propTypes = {
  showFlightController: PropTypes.bool,
  resetStory: PropTypes.func.isRequired,

};

BottomBar.defaultProps = {
  showFlightController: false,
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
