import React, { useEffect, useCallback, useRef } from 'react';

import styles from './TouchWrapper.scss';
import TouchFrame from '../TouchFrame/TouchFrame';
import useTouchInteraction, { TouchInteractionProps } from '../hooks/useTouchInteraction';
import { useDispatch, useSelector } from 'react-redux';
import { connectFlightController, sendFlightControl, toggleTouchMode } from '../../../api/Actions';
import { InputState, Payload } from '../TouchFrame/touchTypes';
import useGestures, { IPointer } from '../hooks/useGesture';

interface TouchWrapperProps {
  children: React.ReactNode;
}

export default function TouchWrapper({ children }: TouchWrapperProps) {
  const dispatch = useDispatch();

  const touchMode = useSelector((state: any) => state.local.touchMode);

  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(connectFlightController());
  }, []);

  const sendFlightControllerInput = useCallback(
    (payload: Payload) => {
      dispatch(sendFlightControl(payload));
    },
    [dispatch]
  );

  // * Code needed to use the frame touch interaction
  // const touchConfig: TouchInteractionProps = {
  //   targetRef: targetRef,
  //   sendFlightControllerInput: sendFlightControllerInput,
  //   operation: 'Rotation'
  // };

  // useTouchInteraction(touchConfig);
  // const gestureType = useGesture();

  const handleTouchEnd = () => {
    sendFlightControllerInput({
      type: 'inputState',
      inputState: {
        values: {
          zoomIn: 0.0,
          orbitX: 0.0,
          orbitY: 0.0,
          panX: 0.0,
          panY: 0.0,
          localRollX: 0.0,
          localRollY: 0.0
        }
      }
    });
  };

  const onDrag = (positions: { dx: number; dy: number }) => {
    if (!targetRef.current) return;

    let dx = positions.dx;
    let dy = positions.dy;

    if (!dx || !dy) return;

    const inputState: InputState = { values: {} };

    // TODO: Scale the rotation depending on the distance of the drag from start position
    inputState.values.orbitX = -dx * 0.0005;
    inputState.values.orbitY = -dy * 0.0005;

    sendFlightControllerInput({ type: 'inputState', inputState });
  };

  const onPinch = (pinch: number) => {
    if (!targetRef.current) return;

    console.log('pinch');

    const inputState: InputState = { values: {} };

    if (pinch > 0) {
      inputState.values.zoomIn = pinch * 0.05;
    } else {
      inputState.values.zoomOut = -pinch * 0.05;
    }

    sendFlightControllerInput({ type: 'inputState', inputState });
  };

  const onRotate = (rotation: number) => {
    if (!targetRef.current) return;

    console.log('rotate');

    const inputState: InputState = { values: {} };
    inputState.values.localRollX = -rotation;
    inputState.values.localRollY = -rotation;

    sendFlightControllerInput({ type: 'inputState', inputState });
  };

  const onDoubleDrag = (deltas: { dx: number; dy: number }) => {
    if (!targetRef.current) return;

    const inputState: InputState = { values: {} };

    inputState.values.panX = -deltas.dx * 0.0005;
    inputState.values.panY = -deltas.dy * 0.0005;

    sendFlightControllerInput({ type: 'inputState', inputState });
  };

  const onTap = (pointer: IPointer) => {
    // ? What do we wanna do on tap?
    console.log('tap:', pointer.position);
  };

  const onHold = (pointer: IPointer) => {
    dispatch(toggleTouchMode(touchMode));
  };

  useGestures(
    targetRef,
    {
      onDragGesture: onDrag,
      onPinchGesture: onPinch,
      onRotateGesture: onRotate,
      onDoubleDragGesture: onDoubleDrag,
      onTapGesture: onTap,
      onHoldGesture: onHold
    },
    8,
    1000,
    handleTouchEnd
  );

  return (
    <div className={styles.wrapper}>
      {/** OpenSpace video stream */}
      <div></div>
      {/* Touch Overlay for Display Space */}
      <div ref={targetRef} className={styles.touchOverlay}></div>
      <TouchFrame />
      {/* Content */}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
