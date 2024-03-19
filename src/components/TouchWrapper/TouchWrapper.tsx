import React, { PointerEventHandler, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { connectFlightController, sendFlightControl } from '../../api/Actions';

import styles from './TouchWrapper.scss';

interface TouchWrapperProps {
  children: React.ReactNode;
}

type InputState = {
  values: {
    zoomIn?: number;
    orbitX?: number;
    orbitY?: number;
    panX?: number;
    panY?: number;
    localRollX?: number;
  };
};

type Payload = {
  type: string;
  inputState: InputState;
};

export default function TouchWrapper({ children }: TouchWrapperProps) {
  const dispatch = useDispatch();

  let touchStartX = 0;
  let touchStartY = 0;
  let mouseIsDown = false;

  useEffect(() => {
    dispatch(connectFlightController());
  }, []);

  function sendFlightControlInput(payload: Payload) {
    dispatch(sendFlightControl(payload));
  }
  function touchDown(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  }

  function mouseDown() {
    mouseIsDown = true;
  }

  function touchMove(event: any) {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    if (touchStartX !== 0) {
      let deltaX = touchX - touchStartX;
      let deltaY = touchY - touchStartY;
      const scaleFactor = 300;
      deltaX /= scaleFactor;
      deltaY /= scaleFactor;

      const inputState: InputState = { values: {} };

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
          zoomIn: 0.0,
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
          zoomIn: 0.0,
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
    const inputState: InputState = { values: {} };

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
    <div
      className={styles.wrapper}
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
    >
      {/** OpenSpace video stream */}
      <div> Video Stream</div>
      {/* Content */}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
