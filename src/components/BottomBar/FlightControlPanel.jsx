import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  connectFlightController,
  disconnectFlightController,
  sendFlightControl,
  setPopoverVisibility,
  subscribeToProperty,
  unsubscribeToProperty,
} from '../../api/Actions';
import { RollFrictionKey, RotationalFrictionKey, ZoomFrictionKey } from '../../api/keys';
import Button from '../common/Input/Button/Button';
import InfoBox from '../common/InfoBox/InfoBox';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Popover from '../common/Popover/Popover';
import Row from '../common/Row/Row';
import styles from './FlightControlPanel.scss';
import Picker from './Picker';

class FlightControlPanel extends Component {
  constructor(props) {
    super(props);
    this.togglePopover = this.togglePopover.bind(this);
    this.toggleRotation = this.toggleRotation.bind(this);
    this.toggleZoom = this.toggleZoom.bind(this);
    this.toggleRoll = this.toggleRoll.bind(this);
    this.touchDown = this.touchDown.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchUp = this.touchUp.bind(this);
    this.mouseUp = this.mouseUp.bind(this);

    this.touchStartX = 0;
    this.touchStartY = 0;
    this.mouseIsDown = false;
  }

  componentDidMount() {
    const { startListening } = this.props;
    startListening(RotationalFrictionKey);
    startListening(ZoomFrictionKey);
    startListening(RollFrictionKey);
  }

  componentWillUnmount() {
    const { stopListening } = this.props;
    stopListening(RotationalFrictionKey);
    stopListening(ZoomFrictionKey);
    stopListening(RollFrictionKey);
  }


  get position() {
    if (!this.wrapper) return { top: '0px', left: '0px' };
    else {
      const { top, right } = this.wrapper.getBoundingClientRect();
      return { top: `${top}px`, left: `${right}px` };
    }
  }

  get popover() {
    const { rotationFriction, rollFriction, zoomFriction } = this.props;
    const rotationButtonColor = rotationFriction ? '#222' : '#888';
    const zoomButtonColor = zoomFriction ? '#222' : '#888';
    const rollButtonColor = rollFriction ? '#222' : '#888';

    const infoBoxContent = <>
      <p>Interact with the area to control the camera. </p> <br/>
      <p><b>Mouse controls:</b></p>
      <p>Click and drag to rotate. Hold</p>
      <ul className={styles.list}>
        <li>SHIFT to pan</li>
        <li>CTRL to zoom (y-axis) or roll (x-axis)</li>
      </ul>
      <br/>
      <p><b>Touch controls:</b></p>
      <ul className={styles.list}>
        <li>1 finger to rotate</li>
        <li>2 fingers to pan</li>
        <li>3 fingers to zoom (y-axis) or roll (x-axis)</li>
      </ul>
    </>

    return (
      <Popover
        className={`${Picker.Popover} && ${styles.flightControlPopover}`}
        title="Flight Control"
        closeCallback={this.togglePopover}
        detachable
        position={{ x: -350, y: -50 }}
        attached={false}
      >
        <div className={Popover.styles.content}>
          <Row>
            <Button
              onClick={this.toggleRotation}
              title="Rotation friction"
              style={{ width: 133, background: rotationButtonColor }}
              disabled={false}
            >
              <span style={{ marginLeft: 5 }}>Rotation</span>
            </Button>
            <Button
              onClick={this.toggleZoom}
              title="Zoom friction"
              style={{ width: 133, background: zoomButtonColor }}
              disabled={false}
            >
              <span style={{ marginLeft: 5 }}>Zoom</span>
            </Button>
            <Button
              onClick={this.toggleRoll}
              title="Roll friction"
              style={{ width: 133, background: rollButtonColor }}
              disabled={false}
            >
              <span style={{ marginLeft: 5 }}>Roll</span>
            </Button>
            <InfoBox className={styles.infoButton} text={"Controls to disable friction for different camera movements"} />
          </Row>
        </div>
        <hr className={Popover.styles.delimiter} />
        <Row>
          <div className={Popover.styles.title}>Control Area</div>
          <InfoBox className={styles.infoButton} text={infoBoxContent} />
        </Row>
        <div
          className={styles.control_area}
          onPointerDown={this.mouseDown}
          onPointerUp={this.mouseUp}
          onPointerCancel={this.mouseUp}
          onPointerLeave={this.mouseUp}
          onLostPointerCapture={this.mouseUp}
          onPointerMove={this.mouseMove}
          onTouchStart={this.touchDown}
          onTouchEnd={this.touchUp}
          onTouchCancel={this.touchUp}
          onTouchMove={this.touchMove}
          id="controlArea"
        />
      </Popover>
    );
  }

  togglePopover() {
    const { popoverVisible } = this.props;
    this.props.setPopoverVisibility(!popoverVisible);
  }

  toggleRotation() {
    const { luaApi, rotationFriction } = this.props;
    luaApi.setPropertyValue(RotationalFrictionKey, !rotationFriction);
  }

  toggleZoom() {
    const { luaApi, zoomFriction } = this.props;
    luaApi.setPropertyValue(ZoomFrictionKey, !zoomFriction);
  }

  toggleRoll() {
    const { luaApi, rollFriction } = this.props;
    luaApi.setPropertyValue(RollFrictionKey, !rollFriction);
  }

  touchDown(event) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  mouseDown(event) {
    this.mouseIsDown = true;
  }

  touchMove(event) {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    if (this.touchStartX !== 0) {
      let deltaX = touchX - this.touchStartX;
      let deltaY = touchY - this.touchStartY;
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

      this.props.sendFlightControl({
        type: 'inputState',
        inputState,
      });
    }
  }

  touchUp(event) {
    this.touchStartX = 0;
    this.props.sendFlightControl({
      type: 'inputState',
      inputState: {
        values: {
          zoomIn: 0.00,
          orbitX: 0.0,
          orbitY: 0.0,
          panX: 0.0,
          panY: 0.0,
          localRollX: 0.0,
        },
      },
    });
  }

  mouseUp(event) {
    if (!this.mouseIsDown) {
      return;
    }
    this.mouseIsDown = false;
    this.props.sendFlightControl({
      type: 'inputState',
      inputState: {
        values: {
          zoomIn: 0.00,
          orbitX: 0.0,
          orbitY: 0.0,
          panX: 0.0,
          panY: 0.0,
          localRollX: 0.0,
        },
      },
    });
  }

  mouseMove(event) {
    if (!this.mouseIsDown) {
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

    this.props.sendFlightControl({
      type: 'inputState',
      inputState,
    });
  }

  render() {
    const { popoverVisible } = this.props;
    return (
      <div className={Picker.Wrapper}>
        <Picker onClick={this.togglePopover}>
          <div>
            <MaterialIcon className={styles.icon} icon="open_with" />
          </div>
        </Picker>
        { popoverVisible && this.popover }
      </div>
    );
  }
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
    rollFriction: rollFrictionProp ? rollFrictionProp.value : false,
  };
};

const mapDispatchToProps = dispatch => ({
  setPopoverVisibility: (visible) => {
    dispatch(setPopoverVisibility({
      popover: 'flightController',
      visible,
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
  },
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
  stopListening: PropTypes.func.isRequired,
};

FlightControlPanel.defaultProps = {
  popoverVisible: false,
  luaApi: undefined,
};

FlightControlPanel = connect(mapStateToProps, mapDispatchToProps)(FlightControlPanel);

export default FlightControlPanel;
