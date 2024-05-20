import { useCallback, useEffect, useRef } from 'react';
import { Vector } from 'ts-matrix';
import useTap from './useTap';
import {
  calculateDelata,
  distance,
  get360angleVector2D,
  normalize,
  twoFingerDirection,
  twoFingerDotProduct
} from './vectorMath';
import { useSelector } from 'react-redux';

export interface IPointer {
  id: number;
  position: Vector;
  delta: Vector;
  clientX: number;
  clientY: number;
}

export interface IGestures {
  onTapGesture?: (pointer: IPointer) => void;
  onHoldGesture?: (pointer: IPointer) => void;
  onDragGesture?: (positions: { dx: number; dy: number }) => void;
  onRotateGesture?: (rotate: number) => void;
  onPinchGesture?: (scale: number) => void;
  onDoubleDragGesture?: (deltas: { dx: number; dy: number }) => void;
  onTripleDragGesture?: (direction: Vector, pointers: IPointer[]) => void;
}

export const useGestures = (
  gestureComponentRef: any,
  gestures: IGestures,
  distanceTreshold: number = 8,
  holdTime: number = 1000,
  endCallback: () => void
) => {
  const touchMode = useSelector((state: any) => state.local.touchMode);

  let touchStartX = 0;
  let touchStartY = 0;

  const {
    onTapGesture,
    onDragGesture,
    onRotateGesture,
    onPinchGesture,
    onDoubleDragGesture,
    onTripleDragGesture,
    onHoldGesture
  } = gestures;

  const getCurrentTouch = () => {
    if (onGoingTouches.current.length > 0) return onGoingTouches.current[0];

    return null;
  };

  const onGoingTouches = useRef<IPointer[]>([]);
  const tap = useTap(distanceTreshold, holdTime, getCurrentTouch, onHoldGesture);

  const copyTouch = useCallback((event: PointerEvent): IPointer => {
    let delta = new Vector([0, 0]);

    const index = onGoingTouchIndexById(event.pointerId);
    if (index !== -1) {
      delta = calculateDelata(event, index, onGoingTouches.current);
    }

    return {
      id: event.pointerId,
      position: new Vector([event.pageX, event.pageY]),
      delta: delta,
      clientX: event.clientX,
      clientY: event.clientY
    };
  }, []);

  const onGoingTouchIndexById = (idToFind: number) => {
    for (var i = 0; i < onGoingTouches.current.length; i++) {
      var id = onGoingTouches.current[i].id;

      if (id === idToFind) {
        return i;
      }
    }
    return -1; // not found
  };

  const pinchGesture = useCallback(() => {
    const curDistance = distance(
      onGoingTouches.current[0].position,
      onGoingTouches.current[1].position
    );

    const delta0 = onGoingTouches.current[0].delta;
    const delta1 = onGoingTouches.current[1].delta;

    const vector0delta0 = onGoingTouches.current[0].position.subtract(delta0);

    const vector1delta1 = onGoingTouches.current[1].position.subtract(delta1);

    const pinch = curDistance - distance(vector0delta0, vector1delta1);

    if (onPinchGesture) {
      const scalingFactor = Math.min(1, Math.log2(curDistance) / 5) * 0.05;

      const scaledPinch = pinch * scalingFactor;

      onPinchGesture(scaledPinch);
    }
  }, [onPinchGesture]);

  const rotateGesture = useCallback(() => {
    const curTouches = onGoingTouches.current;

    const delta0 = onGoingTouches.current[0].delta;
    const delta1 = onGoingTouches.current[1].delta;
    const vector0delta0 = onGoingTouches.current[0].position.subtract(delta0);

    const vector1delta1 = onGoingTouches.current[1].position.subtract(delta1);

    const curDelta = curTouches[0].position.subtract(curTouches[1].position);

    const prevDelta = vector0delta0.subtract(vector1delta1);

    let rotate = get360angleVector2D(curDelta, prevDelta) * 25;

    const scalingFactor = Math.min(1, Math.log2(curDelta.length()) / 50);

    const scaledRotate = rotate * scalingFactor;

    if (onRotateGesture) {
      onRotateGesture(scaledRotate);
    }
  }, [onRotateGesture]);

  const doubleDragGesture = useCallback(
    (touchIndex: number) => {
      // const maxDotProduct = twoFingerDotProduct(onGoingTouches.current);
      // const doubleDrag = twoFingerDirection(onGoingTouches.current);
      // const doubleDragFinal = doubleDrag.multiply(new Vector([maxDotProduct, maxDotProduct]));

      const curTouch = onGoingTouches.current[touchIndex];

      const dx = curTouch.clientX - touchStartX;
      const dy = curTouch.clientY - touchStartY;
      if (onDoubleDragGesture) onDoubleDragGesture({ dx, dy });
    },
    [onDoubleDragGesture]
  );

  // const tripleDragGesture = useCallback(() => {
  //   const curTouches = onGoingTouches.current;
  //   if (onTripleDragGesture === undefined) return;

  //   //twoFingerDotProduct
  //   const _twoFingerDotProduct = twoFingerDotProduct(onGoingTouches.current);
  //   //twoFingerDirection
  //   const _twoFingerDirection = twoFingerDirection(onGoingTouches.current);
  //   //dotProduct
  //   const vec2Normalized = normalize(curTouches[2].delta);
  //   const twoFingerDirectionMultiplied = normalize(
  //     _twoFingerDirection.multiply(new Vector([_twoFingerDotProduct, _twoFingerDotProduct]))
  //   );

  //   const dotProduct = vec2Normalized.dot(twoFingerDirectionMultiplied);
  //   const maxDotProduct = Math.max(0, dotProduct);
  //   //direction
  //   const direction = _twoFingerDirection.add(curTouches[2].delta);
  //   //tripledrag
  //   const tripleDrag = direction.multiply(new Vector([maxDotProduct, maxDotProduct]));

  //   onTripleDragGesture(tripleDrag, curTouches);
  // }, [onTripleDragGesture]);

  const dragGesture = useCallback(
    (touchIndex: number) => {
      const curTouch = onGoingTouches.current[touchIndex];

      let dx = curTouch.clientX - touchStartX;
      let dy = curTouch.clientY - touchStartY;

      const distanceFromStart = Math.sqrt(dx * dx + dy * dy);
      const scalingFactor = Math.min(1, Math.log2(distanceFromStart) / 5000);

      dx *= scalingFactor;
      dy *= scalingFactor;

      if (onDragGesture && touchMode === 'orbit') {
        onDragGesture({ dx, dy });
      } else if (onDoubleDragGesture && touchMode === 'translate') {
        // ? Do we want to scale the camera translation with drag sensitivity?
        onDoubleDragGesture({ dx, dy });
      }
    },
    [onDragGesture, onDoubleDragGesture, touchMode]
  );

  const handleGestures = useCallback(
    (currentTouchIndex: number) => {
      if (onGoingTouches.current.length === 1) {
        tap.updateDistance(onGoingTouches.current[currentTouchIndex].delta.length());
        if (tap.canDrag()) dragGesture(currentTouchIndex);
      } else if (onGoingTouches.current.length === 2) {
        pinchGesture();

        tap.reset();
      } else if (onGoingTouches.current.length === 3) {
        rotateGesture();
        tap.reset();
      }
    },
    [doubleDragGesture, dragGesture, pinchGesture, rotateGesture, tap] // Add tripledraggesture here if needed
  );

  useEffect(() => {
    const handleCancel = (event: PointerEvent) => {
      tap.reset();
      const index = onGoingTouchIndexById(event.pointerId);
      if (index === -1) {
        return;
      }
      onGoingTouches.current.splice(index, 1);
    };

    const handleStart = (event: PointerEvent) => {
      touchStartX = event.clientX;
      touchStartY = event.clientY;

      event.preventDefault();
      onGoingTouches.current.push(copyTouch(event));
      const index = onGoingTouchIndexById(event.pointerId);

      if (onGoingTouches.current.length === 1) tap.startTimer();

      handleGestures(index);
    };

    const handleEnd = (event: PointerEvent) => {
      const index = onGoingTouchIndexById(event.pointerId);
      if (index === -1) {
        return;
      }

      if (onGoingTouches.current.length === 1) {
        tap.differentiatetapHold(
          () => {
            if (onTapGesture) onTapGesture(onGoingTouches.current[index]);
          },
          () => {
            if (onHoldGesture) onHoldGesture(onGoingTouches.current[index]);
          }
        );
      }

      tap.reset();

      onGoingTouches.current.splice(index, 1);

      if (onGoingTouches.current.length === 0) {
        endCallback();
      }
    };

    const handleMove = (event: PointerEvent) => {
      event.preventDefault();
      const index = onGoingTouchIndexById(event.pointerId);
      if (index === -1) {
        return;
      }
      let curPointer = { ...copyTouch(event) };

      onGoingTouches.current.splice(index, 1, curPointer);

      handleGestures(index);
    };

    let component = gestureComponentRef.current;
    component?.addEventListener('pointerdown', handleStart, false);
    component?.addEventListener('pointercancel', handleCancel, false);
    component?.addEventListener('pointerup', handleEnd, false);
    component?.addEventListener('pointermove', handleMove, false);
    component?.addEventListener('pointerleave', handleCancel, false);

    return () => {
      component?.removeEventListener('pointerdown', handleStart);
      component?.removeEventListener('pointercancel', handleCancel);
      component?.removeEventListener('pointerup', handleEnd);
      component?.removeEventListener('pointermove', handleMove);
      component?.removeEventListener('pointerleave', handleCancel);
    };
  }, [gestureComponentRef, tap, copyTouch, handleGestures, onHoldGesture, onTapGesture]);
};

export default useGestures;
