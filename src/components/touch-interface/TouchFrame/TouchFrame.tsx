import React, { useEffect, useRef, useCallback } from 'react';

import { useDispatch } from 'react-redux';
import { connectFlightController, sendFlightControl } from '../../../api/Actions';
import styles from './TouchFrame.scss';
import { Payload } from '../TouchWrapper/TouchWrapper';
import useTouchInteraction, { TouchInteractionProps } from './useTouchInteraction';

export default function TouchFrame() {
  // const dispatch = useDispatch();
  // const targetRef = useRef(null);

  // useEffect(() => {
  //   dispatch(connectFlightController());
  // }, []);

  // const sendFlightControllerInput = useCallback(
  //   (payload: Payload) => {
  //     dispatch(sendFlightControl(payload));
  //   },
  //   [dispatch]
  // );

  // const touchConfig: TouchInteractionProps = {
  //   targetRef: targetRef,
  //   sendFlightControllerInput: sendFlightControllerInput,
  //   operation: 'Pan'
  // };

  // useTouchInteraction(touchConfig);

  return (
    <>
      <div className={`${styles.Frame} ${styles.TopFrame}`} />
      <div className={styles.Corner} />
      <div className={`${styles.Frame} ${styles.RightFrame}`} />
    </>
  );
}
