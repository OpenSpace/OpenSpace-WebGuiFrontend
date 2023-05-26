import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  connectFlightController,
  disconnectFlightController,
  sendFlightControl,
  setPopoverVisibility,
  subscribeToProperty,
  unsubscribeToProperty
} from '../../api/Actions';
import { RollFrictionKey, RotationalFrictionKey, ZoomFrictionKey } from '../../api/keys';
import InfoBox from '../common/InfoBox/InfoBox';
import Button from '../common/Input/Button/Button';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';

import Picker from './Picker';

import styles from './FlightControlPanel.scss';

function FlightControlPanel({
  popoverVisible,
  rotationFriction,
  rollFriction,
  zoomFriction,
  luaApi,
  setPopoverVisibility,
  sendFlightControl,
  connectFlightController,
  disconnectFlightController,
  startListening,
  stopListening
}) {
  React.useEffect(() => {
    startListening(RotationalFrictionKey);
    startListening(ZoomFrictionKey);
    startListening(RollFrictionKey);
    return () => {
      stopListening(RotationalFrictionKey);
      stopListening(ZoomFrictionKey);
      stopListening(RollFrictionKey);
    };
  }, []);

  let touchStartX = 0;
  let touchStartY = 0;
  let mouseIsDown = false;

  function togglePopover() {
    setPopoverVisibility(!popoverVisible);
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

        sendFlightControl({
          type: 'inputState',
          inputState
        });
      }
    }

    function touchUp() {
      touchStartX = 0;
      sendFlightControl({
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
      sendFlightControl({
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

      sendFlightControl({
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
        <hr className={Popover.styles.delimiter} />
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
          <MaterialIcon className={styles.icon} icon="open_with" />
        </div>
      </Picker>
      { popoverVisible && popover() }
    </div>
  );
}

const mapStateToProps = (state) => {
  const { visible } = state.local.popovers.flightController;

  const rotationFrictionProp = state.propertyTree.properties[RotationalFrictionKey];
  const zoomFrictionProp = state.propertyTree.properties[ZoomFrictionKey];
  const rollFrictionProp = state.propertyTree.properties[RollFrictionKey];

  return {
    popoverVisible: visible,
    luaApi: state.luaApi,
    rotationFriction: rotationFrictionProp ? rotationFrictionProp.value : false,
    zoomFriction: zoomFrictionProp ? zoomFrictionProp.value : false,
    rollFriction: rollFrictionProp ? rollFrictionProp.value : false
  };
};

const mapDispatchToProps = (dispatch) => ({
  setPopoverVisibility: (visible) => {
    dispatch(setPopoverVisibility({
      popover: 'flightController',
      visible
    }));
    if (visible) {
      connectFlightController();
    }
  },
  sendFlightControl: (payload) => {
    dispatch(sendFlightControl(payload));
  },
  connectFlightController: () => {
    dispatch(connectFlightController());
  },
  disconnectFlightController: () => {
    dispatch(disconnectFlightController());
  },
  startListening: (uri) => {
    dispatch(subscribeToProperty(uri));
  },
  stopListening: (uri) => {
    dispatch(unsubscribeToProperty(uri));
  }
});

FlightControlPanel.propTypes = {
  popoverVisible: PropTypes.bool,
  rotationFriction: PropTypes.bool.isRequired,
  rollFriction: PropTypes.bool.isRequired,
  zoomFriction: PropTypes.bool.isRequired,
  luaApi: PropTypes.object,
  // Functions
  setPopoverVisibility: PropTypes.func.isRequired,
  sendFlightControl: PropTypes.func.isRequired,
  connectFlightController: PropTypes.func.isRequired,
  disconnectFlightController: PropTypes.func.isRequired,
  startListening: PropTypes.func.isRequired,
  stopListening: PropTypes.func.isRequired
};

FlightControlPanel.defaultProps = {
  popoverVisible: false,
  luaApi: undefined
};

FlightControlPanel = connect(mapStateToProps, mapDispatchToProps)(FlightControlPanel);

export default FlightControlPanel;
