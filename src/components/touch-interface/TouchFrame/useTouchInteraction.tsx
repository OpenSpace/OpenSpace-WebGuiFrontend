import React, { useEffect, useCallback } from 'react';
import { connectFlightController, sendFlightControl } from '../../../api/Actions';
import { useDispatch } from 'react-redux';
import { InputState } from '../TouchWrapper/TouchWrapper';

// * Custom hook to handle touch input on components. Touch logic is moved here to better abstract the logic from the rendering.
// * The benefit of this hooks is that it is also reusable and thus minimzing duplicate code (DRY Principle).

export default function useTouchInteraction() {
  const dispatch = useDispatch();

  let touchStartX = 0;
  let touchStartY = 0;

  useEffect(() => {
    dispatch(connectFlightController());
  }, []);

  const sendFlightControllerInput = useCallback(
    (payload: any) => {
      dispatch(sendFlightControl(payload));
    },
    [dispatch]
  );

  useEffect(() => {
    function handleTouchStart(event: TouchEvent) {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    }

    function handleTouchMove(event: TouchEvent) {
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
        sendFlightControllerInput({
          type: 'inputState',
          inputState
        });
      }
    }

    function handleTouchEnd(event: TouchEvent) {
      touchStartX = 0;
      touchStartY = 0;

      sendFlightControllerInput({
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

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  return { touchStartX, touchStartY };
}
