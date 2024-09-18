/**********************************************************
OpenSpace Streaming Thesis (2022)
----------------------------------------------
This component is the same as the "Flight Control" 
Popover in the FlightControlPanel component, but without 
the Control Area (which has been replaced with the 
  NavigationLayer component).
**********************************************************/

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  connectFlightController,
  setPopoverVisibility,
  subscribeToProperty,
  unsubscribeToProperty,
} from '../../api/Actions';
import { RollFrictionKey, RotationalFrictionKey, ZoomFrictionKey } from '../../api/keys';
import Button from '../common/Input/Button/Button';

import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';
import styles from './FlightSettings.scss';
import Picker from '../BottomBar/Picker';
import { MdOpenWith } from 'react-icons/md';
import { useEffect } from 'react';


function FlightSettings() {
  const rotationFriction = useSelector((state) => state.propertyTree.properties[RotationalFrictionKey]?.value ?? false);
  const zoomFriction = useSelector((state) => state.propertyTree.properties[ZoomFrictionKey]?.value ?? false);
  const rollFriction = useSelector((state) => state.propertyTree.properties[RollFrictionKey]?.value ?? false);
  const luaApi = useSelector(state => state.luaApi);
  const popoverVisible = useSelector((state) => state.local.popovers.flightController.visible);

  const dispatch = useDispatch();
  const dispatchPopoverVisibility = (visible) => {
    dispatch(setPopoverVisibility({
      popover: 'flightController',
      visible,
    }));
    if (visible) {
      dispatch(connectFlightController());
    }
  };

  const startListening = (uri) => {
    dispatch(subscribeToProperty(uri));
  };

  const stopListening = (uri) => {
    dispatch(unsubscribeToProperty(uri));
  };

  useEffect(() => {
    startListening(RotationalFrictionKey);
    startListening(ZoomFrictionKey);
    startListening(RollFrictionKey);
    return () => {
      stopListening(RotationalFrictionKey);
      stopListening(ZoomFrictionKey);
      stopListening(RollFrictionKey);
    }
  }, []);

  function popover() {
    const rotationButtonColor = rotationFriction ? '#222' : '#888';
    const zoomButtonColor = zoomFriction ? '#222' : '#888';
    const rollButtonColor = rollFriction ? '#222' : '#888';
    return (
      <Popover
        className={`${Picker.Popover} && ${styles.flightControlPopover}`}
        title="Flight Control"
        closeCallback={togglePopover}
        detachable
        position={{ x: -350, y: -0 }}
        attached={false}
      >
        <div className={Popover.styles.content}>
          <Row>
            <Button
              onClick={toggleRotation}
              title="orbit"
              style={{ width: 133, background: rotationButtonColor }}
              disabled={false}
            >
              <span style={{ marginLeft: 5 }}>Rotation</span>
            </Button>
            <Button
              onClick={toggleZoom}
              title="orbit"
              style={{ width: 133, background: zoomButtonColor }}
              disabled={false}
            >
              <span style={{ marginLeft: 5 }}>Zoom</span>
            </Button>
            <Button
              onClick={toggleRoll}
              title="orbit"
              style={{ width: 133, background: rollButtonColor }}
              disabled={false}
            >
              <span style={{ marginLeft: 5 }}>Roll</span>
            </Button>

          </Row>
        </div>
      </Popover>
    );
  }

  function togglePopover() {
    dispatchPopoverVisibility(!popoverVisible);
  }

  function toggleRotation() {
    luaApi.setPropertyValue(RotationalFrictionKey, !rotationFriction);
  }

  function toggleZoom() {
    luaApi.setPropertyValue(ZoomFrictionKey, !zoomFriction);
  }

  function toggleRoll() {
    luaApi.setPropertyValue(RollFrictionKey, !rollFriction);
  }

  return (
    <div className={Picker.Wrapper}>
      <Picker onClick={togglePopover}>
        <div>
          <MdOpenWith className={styles.icon} />
        </div>
      </Picker>
      { popoverVisible && popover() }
    </div>
  );
}

export default FlightSettings;