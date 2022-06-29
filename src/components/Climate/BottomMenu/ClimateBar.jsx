import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  subscribeToProperty,
  unsubscribeToProperty,
} from '../../../api/Actions';
import { ExoplanetsModuleEnabledKey, SkyBrowserModuleEnabledKey } from '../../../api/keys';
import { getBoolPropertyValue } from '../../../utils/propertyTreeHelpers';
import styles from '../../BottomBar/BottomBar.scss';
import stylesB from '../../TouchBar/UtilitiesMenu/style/UtilitiesButtons.scss';
import HomeButtonContainer from '../ButtomMenu/ShowStoryButton';
import SessionRec from '../../BottomBar/SessionRec';
import TimePicker from '../../BottomBar/TimePicker';
import ClimatePanel from './ClimatePanel';
import SkyBrowserPanel from '../../BottomBar/SkyBrowserPanel';
import TimePlayerController from '../../TouchBar/UtilitiesMenu/presentational/TimePlayerController'
import TimePlayerClimate from '../../Climate/TimePlayerClimate'
import Instructions from './Instructions'

let BottomBar = ({
  showExoplanets,
  showFlightController,
  showSkyBrowser,
  startListening,
  stopListening,
  resetStory,
  setNoShow,
  showTimeController
}) => {

  useEffect(() => {
    // componentDidMount
    startListening();

    return () => { // componentWillUnmount
      stopListening();
    }
  });

  {console.log("no " + setNoShow)}
  return <div className={styles.BottomBar}>
    <Instructions/>
    <HomeButtonContainer resetStory={resetStory}/>
    <ClimatePanel  setNoShow = {setNoShow}/>
    <TimePicker />
    <TimePlayerController/>

    {showFlightController && <FlightControlPanel/>}

  </div>
};

BottomBar.propTypes = {
  showFlightController : PropTypes.bool,
  showFlightController: PropTypes.bool,
  resetStory: PropTypes.func.isRequired,
};

BottomBar.defaultProps = {
  showFlightController: false,
  showTimeController: true,
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
