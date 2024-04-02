import React, { useEffect } from 'react';
import { InputState, Payload } from '../TouchFrame/touchTypes';

// * Custom hook to handle touch input on components. Touch logic is moved here to better abstract the logic from the rendering.
// * The benefit of this hooks is that it is also reusable and thus minimzing duplicate code (DRY Principle).

export interface TouchInteractionProps {
  targetRef: React.RefObject<HTMLDivElement>;
  sendFlightControllerInput: (payload: Payload) => void;
  operation: 'Rotation' | 'Pan' | 'Zoom';
  direction?: 'X' | 'Y';
}

export default function useTouchInteraction(config: TouchInteractionProps) {
  const { targetRef, sendFlightControllerInput, operation, direction } = config;
  let touchStartX = 0;
  let touchStartY = 0;
  let initialZoomDist = 0;
  const scaleFactor = 1000;

  useEffect(() => {
    if (!targetRef.current || targetRef.current === null) return;

    function isTouchOutsideBounds(touchX: number, touchY: number, boundingRect: DOMRect) {
      return (
        touchX < boundingRect.left ||
        touchX > boundingRect.right ||
        touchY < boundingRect.top ||
        touchY > boundingRect.bottom
      );
    }

    function handleTouch(event: TouchEvent) {
      const touchX = event.touches[0].clientX;
      const touchY = event.touches[0].clientY;
      const boundingRect = targetRef.current?.getBoundingClientRect();

      if (!boundingRect) return;

      if (isTouchOutsideBounds(touchX, touchY, boundingRect)) {
        handleTouchEnd(event);
        return;
      }

      handleTouchOperations(event, touchX, touchY);
    }

    function handleTouchOperations(event: TouchEvent, touchX: number, touchY: number) {
      if (touchStartX !== 0) {
        let deltaX = touchX - touchStartX;
        let deltaY = touchY - touchStartY;

        deltaX /= scaleFactor;
        deltaY /= scaleFactor;

        const inputState: InputState = { values: {} };

        switch (operation) {
          case 'Rotation':
            inputState.values.orbitX = -deltaX;
            inputState.values.orbitY = -deltaY;
            break;
          case 'Pan':
            if (direction === 'X') {
              inputState.values.panX = -deltaX;
            } else if (direction === 'Y') {
              inputState.values.panY = -deltaY;
            }
            break;
          case 'Zoom':
            if (deltaX < 0.0) inputState.values.zoomIn = -deltaX;
            if (deltaY > 0.0) inputState.values.zoomIn = -deltaY;

            inputState.values.localRollX = -deltaX;
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

    function handlePinchToZoom(event: TouchEvent) {
      const zoomDist = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      );

      const deltaZoomDist = zoomDist - initialZoomDist;
      const zoomFactor = deltaZoomDist / scaleFactor;

      const inputState: InputState = { values: {} };
      inputState.values.zoomIn = zoomFactor;

      sendFlightControllerInput({
        type: 'inputState',
        inputState
      });
    }

    function handleRoll(event: TouchEvent) {}

    function handleTouchStart(event: TouchEvent) {
      if (event.touches.length === 2) {
        initialZoomDist = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY
        );
      } else {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      }
    }

    function handleTouchMove(event: TouchEvent) {
      switch (event.touches.length) {
        case 1:
          handleTouch(event);
          break;
        case 2:
          handlePinchToZoom(event);
          break;
        case 3:
        // 3-finger roll
        default:
          break;
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
  }, [targetRef, operation, direction, sendFlightControllerInput]);
}
