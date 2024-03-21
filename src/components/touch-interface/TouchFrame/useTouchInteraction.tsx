import React, { useEffect } from 'react';

import { InputState, Payload } from '../TouchWrapper/TouchWrapper';

// * Custom hook to handle touch input on components. Touch logic is moved here to better abstract the logic from the rendering.
// * The benefit of this hooks is that it is also reusable and thus minimzing duplicate code (DRY Principle).

export interface TouchInteractionProps {
  targetRef: React.RefObject<HTMLDivElement>;
  sendFlightControllerInput: (payload: Payload) => void;
  operation: 'Rotation' | 'Pan' | 'Zoom';
}

export default function useTouchInteraction(config: TouchInteractionProps) {
  const { targetRef, sendFlightControllerInput, operation } = config;
  let touchStartX = 0;
  let touchStartY = 0;

  useEffect(() => {
    if (!targetRef.current || targetRef.current === null) return;

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
        const scaleFactor = 1000;
        deltaX /= scaleFactor;
        deltaY /= scaleFactor;

        const inputState: InputState = { values: {} };

        switch (operation) {
          case 'Rotation':
            inputState.values.orbitX = -deltaX;
            inputState.values.orbitY = -deltaY;
            break;
          case 'Pan':
            inputState.values.panX = -deltaX;
            inputState.values.panY = -deltaY;
            break;
          case 'Zoom':
            inputState.values.zoomIn = -deltaY;
            // ?: Ask Emma why we want to do a x roll on zoom?
            // inputState.values.localRollX = -deltaX;
            break;
          default:
            break;
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

    targetRef.current.addEventListener('touchstart', handleTouchStart);
    targetRef.current.addEventListener('touchmove', handleTouchMove);
    targetRef.current.addEventListener('touchend', handleTouchEnd);
    targetRef.current.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      if (targetRef.current === null) return;
      targetRef.current.removeEventListener('touchstart', handleTouchStart);
      targetRef.current.removeEventListener('touchmove', handleTouchMove);
      targetRef.current.removeEventListener('touchend', handleTouchEnd);
      targetRef.current.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [targetRef, operation]);
}
