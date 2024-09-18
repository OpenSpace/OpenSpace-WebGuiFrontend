/**********************************************************
OpenSpace Streaming Thesis (2022)
----------------------------------------------
This component is the same as the "Control Area" 
div in the FlightControlPanel component, but is spanned 
over the entire screen.
**********************************************************/

import React, { useRef } from 'react';
 import {
   sendFlightControl
 } from '../../api/Actions';
import styles from  './NavigationLayer.scss';

function NavigationLayer() {
  const dispatch = useDispatch();

  const dispatchFlightControl = (payload) => {
    dispatch(sendFlightControl(payload));
  };

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  function touchDown(event) {
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  }

  function mouseDown(event) {
    touchStartX.current = event.clientX;
    touchStartY.current = event.clientY;
  }

  function touchMove(event) {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    if (touchStartX.current != 0) {
      var deltaX = touchX - touchStartX.current;
      var deltaY = touchY - touchStartY.current;
      var scaleFactor = 300;
      deltaX /= scaleFactor;
      deltaY /= scaleFactor;

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

      dispatchFlightControl({
        type: "inputState",
        inputState: inputState
      })
    }
  }

  function touchUp(event) {
    touchStartX.current = 0;
    dispatchFlightControl({
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

  function mouseMove(event) {
    if (touchStartX.current != 0) {
      const deltaX = event.movementX/20;
      const deltaY = -event.movementY/20;
      const inputState = {values: {}};

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

      dispatchFlightControl({
        type: "inputState",
        inputState: inputState
      })
    }
  }

  return (
    <div className={styles.control_area}
      onPointerDown={mouseDown}
      onPointerUp={touchUp}
      onPointerCancel={touchUp}
      onPointerLeave={touchUp}
      onLostPointerCapture={touchUp}
      onPointerMove={mouseMove}
      onTouchStart={touchDown}
      onTouchEnd={touchUp}
      onTouchCancel={touchUp}
      onTouchMove={touchMove}
    />
  );
}

export default NavigationLayer;