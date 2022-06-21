/**********************************************************
OpenSpace Streaming Thesis (2022)
----------------------------------------------
This component is the same as the "Control Area" 
div in the FlightControlPanel component, but is spanned 
over the entire screen.
**********************************************************/

import React, { Component } from 'react';
 import { connect } from 'react-redux';
 import { 
   connectFlightController,
   sendFlightControl,
   setPopoverVisibility,
   subscribeToProperty,
   unsubscribeToProperty
 } from '../../api/Actions';
import { RollFrictionKey, RotationalFrictionKey, ZoomFrictionKey } from '../../api/keys';
import styles from  './NavigationLayer.scss';


class NavigationLayer extends Component {
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

  render() {
    return (      
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
  );
  };

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

NavigationLayer =
  connect(mapStateToProps, mapDispatchToProps)(NavigationLayer);

export default NavigationLayer;