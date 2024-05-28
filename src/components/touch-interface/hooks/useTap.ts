import { useRef } from 'react';
import { IPointer } from './useGesture';

export interface ITap {
  distance: number;
  timer: NodeJS.Timeout | null;
  timerTime: number;
  lastTapTime?: number | null;
  doubleTapTimeout?: NodeJS.Timeout | null;
}

const useTap = (
  distanceTreshold: number,
  holdTime: number,
  getCurrentTouch: () => IPointer | null,
  onHoldGesture: ((pointer: IPointer) => void) | undefined,
  doubleTapThreshold: number,
  onDoubleTap?: (pointer: IPointer) => void | undefined
) => {
  const tapInfo = useRef<ITap>({
    distance: 10,
    timer: null,
    timerTime: 0,
    lastTapTime: null,
    doubleTapTimeout: null
  });

  const startTimer = () => {
    if (tapInfo.current.timer) {
      reset();
    } else {
      tapInfo.current.timer = setInterval(() => {
        tapInfo.current.timerTime += 100;
        if (!onHoldGesture) return;
        if (
          tapInfo.current.timerTime >= holdTime &&
          tapInfo.current.distance > 0 &&
          tapInfo.current.distance <= distanceTreshold
        ) {
          const pointer = getCurrentTouch();
          if (pointer) onHoldGesture(pointer);
          reset();
        }
      }, 100);
    }
  };

  const stopTimer = () => {
    if (tapInfo.current.timer) {
      clearInterval(tapInfo.current.timer);
      tapInfo.current.timerTime = 0;
    }
  };

  const reset = () => {
    tapInfo.current.distance = distanceTreshold;
    tapInfo.current.timerTime = 0;
    stopTimer();
    tapInfo.current.timer = null;

    if (tapInfo.current.doubleTapTimeout) {
      clearTimeout(tapInfo.current.doubleTapTimeout);
      tapInfo.current.doubleTapTimeout = null;
    }
  };

  const updateDistance = (traveled: number) => {
    if (tapInfo.current.timer) tapInfo.current.distance -= traveled;
  };

  const differentiatetapHold = (onTap: () => void, onHold: () => void) => {
    if (!tapInfo.current.timer) {
      return;
    }

    if (
      tapInfo.current.timerTime < holdTime &&
      tapInfo.current.distance > 0 &&
      tapInfo.current.distance <= distanceTreshold
    ) {
      const currentTime = Date.now();
      if (
        tapInfo.current.lastTapTime &&
        currentTime - tapInfo.current.lastTapTime < doubleTapThreshold
      ) {
        const pointer = getCurrentTouch();
        if (pointer && onDoubleTap) onDoubleTap(pointer);

        reset();
      } else {
        // ! Should trigger a single tap but not working correctly at the moment

        tapInfo.current.lastTapTime = currentTime;
        tapInfo.current.doubleTapTimeout = setTimeout(() => {
          onTap();
          reset();
        }, doubleTapThreshold);
      }
    } else if (
      tapInfo.current.timerTime >= holdTime &&
      tapInfo.current.distance > 0 &&
      tapInfo.current.distance <= distanceTreshold
    ) {
      onHold();
      reset();
    }
  };

  const canDrag = () => {
    if (tapInfo.current.distance > 0 && tapInfo.current.distance <= distanceTreshold) {
      return false;
    }
    return true;
  };

  return {
    startTimer,
    stopTimer,
    reset,
    updateDistance,
    differentiatetapHold,
    canDrag
  };
};

export default useTap;
