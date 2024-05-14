import React, { useEffect, useRef, useCallback } from 'react';

import { useDispatch } from 'react-redux';
import type { Dispatch } from 'redux';
import { connectFlightController, sendFlightControl } from '../../../api/Actions';
import styles from './TouchFrame.scss';
import useTouchInteraction from '../hooks/useTouchInteraction';
import { Payload } from './touchTypes';

export default function TouchFrame() {
  const dispatch: Dispatch = useDispatch();
  // const topFrameRef = useRef(null);
  const rightFrameRef = useRef(null);
  // const cornerRef = useRef(null);

  useEffect(() => {
    dispatch(connectFlightController());
  }, []);

  const sendFlightControllerInput = useCallback(
    (payload: Payload) => {
      dispatch(sendFlightControl(payload));
    },
    [dispatch]
  );

  // useTouchInteraction({
  //   targetRef: topFrameRef,
  //   sendFlightControllerInput,
  //   operation: 'Pan',
  //   direction: 'X'
  // });

  useTouchInteraction({
    targetRef: rightFrameRef,
    sendFlightControllerInput,
    operation: 'Zoom',
    direction: 'Y'
  });

  // useTouchInteraction({ targetRef: cornerRef, sendFlightControllerInput, operation: 'Zoom' });

  return (
    <>
      {/* <div ref={topFrameRef} className={`${styles.Frame} ${styles.TopFrame}`} />
      <div ref={cornerRef} className={styles.Corner} /> */}
      <div ref={rightFrameRef} className={`${styles.Frame} ${styles.RightFrame}`} />
    </>
  );
}
