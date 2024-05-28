import React, { useEffect, useRef, useCallback } from 'react';

import { useDispatch } from 'react-redux';
import type { Dispatch } from 'redux';
import { connectFlightController, sendFlightControl } from '../../../api/Actions';
import styles from './TouchFrame.scss';
import useTouchInteraction from '../hooks/useTouchInteraction';
import { Payload } from './touchTypes';

export default function TouchFrame() {
  const dispatch: Dispatch = useDispatch();
  const frame = useRef(null);

  useEffect(() => {
    dispatch(connectFlightController());
  }, []);

  const sendFlightControllerInput = useCallback(
    (payload: Payload) => {
      dispatch(sendFlightControl(payload));
    },
    [dispatch]
  );

  useTouchInteraction({
    targetRef: frame,
    sendFlightControllerInput,
    operation: 'Zoom',
    direction: 'Y'
  });

  return <div ref={frame} className={`${styles.Frame} ${styles.RightFrame}`} />;
}
