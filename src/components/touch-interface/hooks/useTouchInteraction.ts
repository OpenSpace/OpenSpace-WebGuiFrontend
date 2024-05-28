import React, { useEffect } from 'react';
import { Payload } from '../TouchFrame/touchTypes';
import { calculateInputState, isTouchOutsideBounds } from './touch-interaction-utils';

// * Custom hook to handle touch input on components such as touchframe.
// * This component implementation of touch interaction differs greatly from the touch gestures.
// * May want to in the future refactor to have a similar implementation to the  useGestures hook.

export interface TouchInteractionProps {
  targetRef: React.RefObject<HTMLDivElement>;
  sendFlightControllerInput: (payload: Payload) => void;
  operation: 'Rotation' | 'Pan' | 'Zoom';
  direction?: 'X' | 'Y';
}

// Need to cache events to support 2-finger gestures such as pinch to zoom
const eventCache: PointerEvent[] = [];

function getCache() {
  return eventCache;
}

function pushEvent(ev: PointerEvent) {
  const evCache = getCache();
  evCache.push(ev);
}

function removeEvent(ev: PointerEvent) {
  const evCache = getCache();
  const index = evCache.findIndex((cachedEv) => cachedEv.pointerId === ev.pointerId);
  evCache.splice(index, 1);
}

export default function useTouchInteraction({
  targetRef,
  sendFlightControllerInput,
  operation,
  direction
}: TouchInteractionProps) {
  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(event: PointerEvent) {
    event.preventDefault();

    pushEvent(event);

    touchStartX = event.clientX;
    touchStartY = event.clientY;
  }

  function handleTouchMove(event: PointerEvent) {
    const index = eventCache.findIndex((cachedEv) => cachedEv.pointerId === event.pointerId);
    eventCache[index] = event;

    const boundingRect = targetRef.current?.getBoundingClientRect();

    if (!boundingRect || isTouchOutsideBounds(event.clientX, event.clientY, boundingRect)) {
      handleTouchEnd(event);
      return;
    }

    const inputState = calculateInputState(
      touchStartX,
      touchStartY,
      event,
      operation,
      eventCache,
      direction
    );

    if (inputState) {
      sendFlightControllerInput({
        type: 'inputState',
        inputState
      });
    }
  }

  function handleTouchEnd(event: PointerEvent) {
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

    removeEvent(event);
  }

  useEffect(() => {
    if (!targetRef.current) return;

    targetRef.current.addEventListener('pointerdown', handleTouchStart);
    targetRef.current.addEventListener('pointermove', handleTouchMove);
    targetRef.current.addEventListener('pointerup', handleTouchEnd);
    targetRef.current.addEventListener('pointerleave', handleTouchEnd);
    targetRef.current.addEventListener('pointercancel', handleTouchEnd);

    return () => {
      if (!targetRef.current) return;

      targetRef.current.removeEventListener('pointerdown', handleTouchStart);
      targetRef.current.removeEventListener('pointermove', handleTouchMove);
      targetRef.current.removeEventListener('pointerup', handleTouchEnd);
      targetRef.current.removeEventListener('pointerleave', handleTouchEnd);
      targetRef.current.removeEventListener('pointercancel', handleTouchEnd);
    };
  }, [targetRef, operation, direction, sendFlightControllerInput]);
}
