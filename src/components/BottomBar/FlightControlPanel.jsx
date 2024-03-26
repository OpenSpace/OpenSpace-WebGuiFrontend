import React from 'react';
import { MdOpenWith } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

import {
  connectFlightController,
  sendFlightControl,
  setPopoverVisibility,
  subscribeToProperty,
  unsubscribeToProperty
} from '../../api/Actions';
import { RollFrictionKey, RotationalFrictionKey, ZoomFrictionKey } from '../../api/keys';
import HorizontalDelimiter from '../common/HorizontalDelimiter/HorizontalDelimiter';
import InfoBox from '../common/InfoBox/InfoBox';
import Button from '../common/Input/Button/Button';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';

import Picker from './Picker';

import styles from './FlightControlPanel.scss';

export default function FlightControlPanel() {
  const luaApi = useSelector((state) => state.luaApi);
  const popoverVisible = useSelector((state) => state.local.popovers.flightController.visible);

  const rotationFriction = useSelector(
    (state) => state.propertyTree.properties[RotationalFrictionKey]?.value || false
  );

  const zoomFriction = useSelector(
    (state) => state.propertyTree.properties[ZoomFrictionKey]?.value || false
  );

  const rollFriction = useSelector(
    (state) => state.propertyTree.properties[RollFrictionKey]?.value || false
  );

  const dispatch = useDispatch();

  let touchStartX = 0;
  let touchStartY = 0;
  let mouseIsDown = false;

  React.useEffect(() => {
    function subscribeTo(uri) {
      dispatch(subscribeToProperty(uri));
    }

    function unsubscribe(uri) {
      dispatch(unsubscribeToProperty(uri));
    }

    subscribeTo(RotationalFrictionKey);
    subscribeTo(ZoomFrictionKey);
    subscribeTo(RollFrictionKey);
    return () => {
      unsubscribe(RotationalFrictionKey);
      unsubscribe(ZoomFrictionKey);
      unsubscribe(RollFrictionKey);
    };
  }, []);

  function sendFlightControlInput(payload) {
    dispatch(sendFlightControl(payload));
  }

  function togglePopover() {
    const visible = !popoverVisible;

    dispatch(setPopoverVisibility({
      popover: 'flightController',
      visible
    }));

    // @TODO (2023-05-26, emmbr)I believe we should also handle disconnection a bit better, or at
    // least try to avoid connecting if alreday connected
    if (visible) {
      dispatch(connectFlightController());
    }
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

  function popover() {
    const rotationButtonColor = rotationFriction ? '#222' : '#888';
    const zoomButtonColor = zoomFriction ? '#222' : '#888';
    const rollButtonColor = rollFriction ? '#222' : '#888';

    const infoBoxContent = (
      <>
        <p>Interact with the area to control the camera. </p>
        {' '}
        <br />
        <p><b>Mouse controls:</b></p>
        <p>Click and drag to rotate. Hold</p>
        <ul className={styles.list}>
          <li>SHIFT to pan</li>
          <li>CTRL to zoom (y-axis) or roll (x-axis)</li>
        </ul>
        <br />
        <p><b>Touch controls:</b></p>
        <ul className={styles.list}>
          <li>1 finger to rotate</li>
          <li>2 fingers to pan</li>
          <li>3 fingers to zoom (y-axis) or roll (x-axis)</li>
        </ul>
      </>
    );

    function touchDown(event) {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }

    function mouseDown() {
      mouseIsDown = true;
    }

    function touchMove(event) {
      const touchX = event.touches[0].clientX;
      const touchY = event.touches[0].clientY;

      if (touchStartX !== 0) {
        let deltaX = touchX - touchStartX;
        let deltaY = touchY - touchStartY;
        const scaleFactor = 300;
        deltaX /= scaleFactor;
        deltaY /= scaleFactor;

        const inputState = { values: {} };

        if (event.touches.length === 1) {
          inputState.values.orbitX = -deltaX;
          inputState.values.orbitY = -deltaY;
        } else if (event.touches.length === 2) {
          inputState.values.panX = -deltaX;
          inputState.values.panY = -deltaY;
        } else if (event.touches.length === 3) {
          inputState.values.zoomIn = -deltaY;
          inputState.values.localRollX = -deltaX;
        }

        sendFlightControlInput({
          type: 'inputState',
          inputState
        });
      }
    }

    function touchUp() {
      touchStartX = 0;
      sendFlightControlInput({
        type: 'inputState',
        inputState: {
          values: {
            zoomIn: 0.00,
            orbitX: 0.0,
            orbitY: 0.0,
            panX: 0.0,
            panY: 0.0,
            localRollX: 0.0
          }
        }
      });
    }

    function mouseUp() {
      if (!mouseIsDown) {
        return;
      }
      mouseIsDown = false;
      sendFlightControlInput({
        type: 'inputState',
        inputState: {
          values: {
            zoomIn: 0.00,
            orbitX: 0.0,
            orbitY: 0.0,
            panX: 0.0,
            panY: 0.0,
            localRollX: 0.0
          }
        }
      });
    }

    function mouseMove(event) {
      if (!mouseIsDown) {
        return;
      }

      const deltaX = event.movementX / 20;
      const deltaY = -event.movementY / 20;
      const inputState = { values: {} };

      if (event.shiftKey) {
        inputState.values.panX = -deltaX;
        inputState.values.panY = deltaY;
      } else if (event.ctrlKey) {
        inputState.values.zoomIn = deltaY;
        inputState.values.localRollX = -deltaX;
      } else {
        inputState.values.orbitX = -deltaX;
        inputState.values.orbitY = deltaY;
      }

      sendFlightControlInput({
        type: 'inputState',
        inputState
      });
    }

    return (
      <Popover
        className={`${Picker.Popover} && ${styles.flightControlPopover}`}
        title="Flight Control"
        closeCallback={togglePopover}
        detachable
        position={{ x: -350, y: -50 }}
        attached={false}
      >
        <div className={Popover.styles.content}>
          <Row>
            <Button
              onClick={toggleRotation}
              title="Rotation friction"
              style={{ width: 133, background: rotationButtonColor }}
              disabled={false}
            >
              <span style={{ marginLeft: 5 }}>Rotation</span>
            </Button>
            <Button
              onClick={toggleZoom}
              title="Zoom friction"
              style={{ width: 133, background: zoomButtonColor }}
              disabled={false}
            >
              <span style={{ marginLeft: 5 }}>Zoom</span>
            </Button>
            <Button
              onClick={toggleRoll}
              title="Roll friction"
              style={{ width: 133, background: rollButtonColor }}
              disabled={false}
            >
              <span style={{ marginLeft: 5 }}>Roll</span>
            </Button>
            <InfoBox className={styles.infoButton} text="Controls to disable friction for different camera movements" />
          </Row>
        </div>
        <HorizontalDelimiter />
        <Row>
          <div className={Popover.styles.title}>Control Area</div>
          <InfoBox className={styles.infoButton} text={infoBoxContent} />
        </Row>
        <div
          className={styles.control_area}
          onPointerDown={mouseDown}
          onPointerUp={mouseUp}
          onPointerCancel={mouseUp}
          onPointerLeave={mouseUp}
          onLostPointerCapture={mouseUp}
          onPointerMove={mouseMove}
          onTouchStart={touchDown}
          onTouchEnd={touchUp}
          onTouchCancel={touchUp}
          onTouchMove={touchMove}
          id="controlArea"
        />
      </Popover>
    );
  }

  return (
    <div className={Picker.Wrapper}>
      <Picker onClick={togglePopover}>
        <div>
          <MdOpenWith className={Picker.Icon} alt="flightcontrol" />
        </div>
      </Picker>
      { popoverVisible && popover() }
    </div>
  );
}
