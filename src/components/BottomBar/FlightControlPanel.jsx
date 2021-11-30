import React, { Component } from 'react';
import Popover from '../common/Popover/Popover';
import Button from '../common/Input/Button/Button';
import Picker from './Picker';
import MaterialIcon from '../common/MaterialIcon/MaterialIcon';
import Input from '../common/Input/Input/Input';
import CenteredLabel from '../common/CenteredLabel/CenteredLabel';
import Row from '../common/Row/Row';

import ScrollOverlay from '../common/ScrollOverlay/ScrollOverlay';

import { setPopoverVisibility, connectFlightController, sendFlightControl } from '../../api/Actions';
import { connect } from 'react-redux';
import { subscribeToProperty, unsubscribeToProperty } from '../../api/Actions';

import styles from './FlightControlPanel.scss';

import PropertyOwner from '../Sidebar/Properties/PropertyOwner'

import { RotationalFrictionKey, ZoomFrictionKey, RollFrictionKey } from '../../api/keys';

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
    this.touchStartX = 0;
    this.touchStartY = 0;
  }

  componentDidMount() {
      this.props.startListening(RotationalFrictionKey);
      this.props.startListening(ZoomFrictionKey);
      this.props.startListening(RollFrictionKey);
  }

  componentWillUnmount() {
    this.props.stopListening(RotationalFrictionKey);
    this.props.stopListening(ZoomFrictionKey);
    this.props.stopListening(RollFrictionKey);
  }

  togglePopover() {
    this.props.setPopoverVisibility(!this.props.popoverVisible)
  }

  toggleRotation() {
    this.props.luaApi.setPropertyValue(RotationalFrictionKey,!this.props.rotationFriction);
  }

  toggleZoom() {
    this.props.luaApi.setPropertyValue(ZoomFrictionKey,!this.props.zoomFriction);
  }

  toggleRoll() {
    this.props.luaApi.setPropertyValue(RollFrictionKey,!this.props.rollFriction);
  }

  touchDown(event) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  mouseDown(event) {
    this.touchStartX = event.clientX;
    this.touchStartY = event.clientY;
  }

  touchMove(event) {
    var touchX = event.touches[0].clientX;
    var touchY = event.touches[0].clientY;

    if (this.touchStartX != 0) {
      var deltaX = touchX - this.touchStartX;
      var deltaY = touchY - this.touchStartY;
      var scaleFactor = 300;
      deltaX /= scaleFactor;
      deltaY /= scaleFactor;

      var zoomIn = 0;
      var orbitX = 0;
      var orbitY = 0;
      var inputState = {values: {}};

      if (event.touches.length == 1) {
        inputState.values["orbitX"] = -deltaX;
        inputState.values["orbitY"] = -deltaY;
      } else if (event.touches.length == 2) {
        inputState.values["panX"] = -deltaX;
        inputState.values["panY"] = -deltaY;
      } else if (event.touches.length == 3) {
        inputState.values["zoomIn"] = -deltaY;
        inputState.values["localRollX"] = -deltaX;
      }

      this.props.sendFlightControl({
        "type": "inputState",
        "inputState": inputState
      })
    } 
  }

  touchUp(event) {
    this.touchStartX = 0;
    this.props.sendFlightControl({
      type: "inputState",
      inputState: {values: {
        "zoomIn": 0.00,
        "orbitX": 0.0,
        "orbitY": 0.0,
        "panX": 0.0,
        "panY": 0.0,
        "localRollX": 0.0,
      }}
    })
  }

  mouseMove(event) {
    if (this.touchStartX != 0) {
      var zoomIn = 0;
      var orbitX = 0;
      var orbitY = 0;

      var deltaX = event.movementX/20;
      var deltaY = -event.movementY/20;
      var inputState = {values: {}};

      if (event.shiftKey) {
        inputState.values["panX"] = -deltaX;
        inputState.values["panY"] = deltaY;
      } else if (event.ctrlKey) {
        inputState.values["zoomIn"] = deltaY;
        inputState.values["localRollX"] = -deltaX;
      } else {
        inputState.values["orbitX"] = -deltaX;
        inputState.values["orbitY"] = deltaY;
      }

      this.props.sendFlightControl({
        "type": "inputState",
        "inputState": inputState
      })
    }
  }

  get popover() {
    const rotationButtonColor = this.props.rotationFriction ? "#222" : "#888";
    const zoomButtonColor = this.props.zoomFriction ? "#222" : "#888";
    const rollButtonColor = this.props.rollFriction ? "#222" : "#888";

    return (
      <Popover
        className={`${Picker.Popover} && ${styles.flightControlPopover}`}
        title="Flight Control"
        closeCallback={this.togglePopover}
        detachable
        position={{x: -350, y: -50}}
        attached={false}
      >        
        <div className={Popover.styles.content}>
          <Row>
           <Button onClick={this.toggleRotation}
                    title="orbit"
                    style={{width: 133, background: rotationButtonColor}}
                    disabled={false}>
              <span style={{marginLeft: 5}}>Rotation</span>
            </Button>
           <Button onClick={this.toggleZoom}
                    title="orbit"
                    style={{width: 133, background: zoomButtonColor}}
                    disabled={false}>
              <span style={{marginLeft: 5}}>Zoom</span>
            </Button>
            <Button onClick={this.toggleRoll}
                    title="orbit"
                    style={{width: 133, background: rollButtonColor}}
                    disabled={false}>
              <span style={{marginLeft: 5}}>Roll</span>
            </Button>

          </Row>
        </div>
        <hr className={Popover.styles.delimiter} />
        <div className={Popover.styles.title}>Control Area </div>
        <div className={styles.control_area} 
              onPointerDown={this.mouseDown} 
              onPointerUp={this.touchUp}
              onPointerCancel={this.touchUp}
              onPointerLeave={this.touchUp}
              onLostPointerCapture={this.touchUp}
              onPointerMove={this.mouseMove} 
              onTouchStart={this.touchDown} 
              onTouchEnd={this.touchUp} 
              onTouchCancel={this.touchUp} 
              onTouchMove={this.touchMove} 
              id="controlArea">
        </div>
      </Popover>
    );
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

const mapStateToProps = state => {

  const visible = state.local.popovers.flightController.visible;

  const rotationFrictionProp = state.propertyTree.properties[RotationalFrictionKey];
  const zoomFrictionProp = state.propertyTree.properties[ZoomFrictionKey];
  const rollFrictionProp = state.propertyTree.properties[RollFrictionKey];

  return {
    popoverVisible: visible,
    luaApi: state.luaApi,
    rotationFriction: rotationFrictionProp ? rotationFrictionProp.value : false,
    zoomFriction: zoomFrictionProp ? zoomFrictionProp.value : false,
    rollFriction: rollFrictionProp ? rollFrictionProp.value : false,
  }
};

const mapDispatchToProps = dispatch => ({
  setPopoverVisibility: visible => {
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
})

FlightControlPanel =
  connect(mapStateToProps, mapDispatchToProps)(FlightControlPanel);

export default FlightControlPanel;
