import { InputState } from '../TouchFrame/touchTypes';

const scaleFactor = 1000;

export function isTouchOutsideBounds(touchX: number, touchY: number, boundingRect: DOMRect) {
  return (
    touchX < boundingRect.left ||
    touchX > boundingRect.right ||
    touchY < boundingRect.top ||
    touchY > boundingRect.bottom
  );
}

export function calculateInputState(
  touchStartX: number,
  touchStartY: number,
  event: PointerEvent,
  operation: string,
  eventCache: PointerEvent[],
  direction?: string
) {
  if (touchStartX !== 0 || touchStartY !== 0) {
    const inputState: InputState = { values: {} };

    if (eventCache.length === 2) {
      handlePinchToZoom(inputState, eventCache);
    } else {
      let deltaX = event.clientX - touchStartX;
      let deltaY = event.clientY - touchStartY;

      deltaX /= scaleFactor;
      deltaY /= scaleFactor;

      switch (operation) {
        case 'Rotation':
          handleRotation(inputState, deltaX, deltaY);
          break;
        case 'Pan':
          handlePan(inputState, deltaX, deltaY, direction);
          break;
        case 'Zoom':
          handleZoom(inputState, deltaY);
          break;
        default:
          break;
      }
    }

    return inputState;
  }

  return null;
}

function handleRotation(inputState: InputState, deltaX: number, deltaY: number) {
  inputState.values.orbitX = -deltaX;
  inputState.values.orbitY = -deltaY;
}

function handlePan(inputState: InputState, deltaX: number, deltaY: number, direction?: string) {
  if (direction === 'X') {
    inputState.values.panX = -deltaX;
  } else if (direction === 'Y') {
    inputState.values.panY = -deltaY;
  }
}

function handleZoom(inputState: InputState, deltaY: number) {
  const zoomSpeed = 1.01; // Change this to adjust the speed of exponential zoom

  if (deltaY < 0) {
    // Exponential zoom in for deltaY
    inputState.values.zoomIn = Math.pow(zoomSpeed, deltaY);
  } else if (deltaY > 0) {
    // Exponential zoom out for deltaY
    inputState.values.zoomOut = Math.pow(zoomSpeed, -deltaY);
  }
}

let prevDiff = -1;
function handlePinchToZoom(inputState: InputState, evCache: PointerEvent[]) {
  const curDiff = Math.hypot(
    evCache[0].clientX - evCache[1].clientX,
    evCache[0].clientY - evCache[1].clientY
  );

  const zoomFactor = curDiff / scaleFactor;

  if (prevDiff > 0) {
    if (curDiff > prevDiff) {
      // The distance between the two pointers has increased
      inputState.values.zoomIn = zoomFactor;
    }
    if (curDiff < prevDiff) {
      // The distance between the two pointers has decreased
      inputState.values.zoomOut = zoomFactor;
    }
  }
  prevDiff = curDiff;
}
