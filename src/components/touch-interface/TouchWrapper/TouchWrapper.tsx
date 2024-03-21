import React, { useEffect, useCallback, useRef } from 'react';

import styles from './TouchWrapper.scss';
import TouchFrame from '../TouchFrame/TouchFrame';
import useTouchInteraction, { TouchInteractionProps } from '../TouchFrame/useTouchInteraction';
import { TouchState } from '../TouchFrame/touchTypes';
import { useDispatch } from 'react-redux';
import { connectFlightController, sendFlightControl } from '../../../api/Actions';

interface TouchWrapperProps {
  children: React.ReactNode;
}

export type InputState = {
  values: {
    zoomIn?: number;
    orbitX?: number;
    orbitY?: number;
    panX?: number;
    panY?: number;
    localRollX?: number;
  };
};

export type Payload = {
  type: string;
  inputState: InputState;
};

export default function TouchWrapper({ children }: TouchWrapperProps) {
  const dispatch = useDispatch();
  const targetRef = useRef(null);

  useEffect(() => {
    dispatch(connectFlightController());
  }, []);

  const sendFlightControllerInput = useCallback(
    (payload: Payload) => {
      dispatch(sendFlightControl(payload));
    },
    [dispatch]
  );

  const touchConfig: TouchInteractionProps = {
    targetRef: targetRef,
    sendFlightControllerInput: sendFlightControllerInput,
    operation: 'Rotation'
  };

  useTouchInteraction(touchConfig);

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
