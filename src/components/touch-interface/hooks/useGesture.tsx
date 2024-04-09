import React, { useState } from 'react';

interface TouchPoint {
  id: number;
  position: { x: number; y: number };
  speed: number;
}

const useGesture = (threshold = 10): string => {
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [gestureType, setGestureType] = useState('');

  const calculateSpeed = (
    touchPoint: { x: number; y: number },
    prevTouchPoint: { x: number; y: number },
    deltaTime: number
  ) => {
    const distance = Math.sqrt(
      Math.pow(touchPoint.x - prevTouchPoint.x, 2) + Math.pow(touchPoint.y - prevTouchPoint.y, 2)
    );

    return distance / deltaTime;
  };

  React.useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touches = e.touches;

      const newTouchPoints = Array.from(touches).map((touch) => {
        const existingTouchPoint = touchPoints?.find(
          (tp: TouchPoint) => tp.id === touch.identifier
        );
        const prevPosition = existingTouchPoint
          ? existingTouchPoint.position
          : { x: touch.clientX, y: touch.clientY };
        const speed = existingTouchPoint
          ? calculateSpeed({ x: touch.clientX, y: touch.clientY }, prevPosition, 1)
          : 0;

        return {
          id: touch.identifier,
          position: { x: touch.clientX, y: touch.clientY },
          speed: speed
        };
      });

      setTouchPoints(newTouchPoints);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touches = e.touches;

      const newTouchPoints = Array.from(touches).map((touch) => {
        return {
          id: touch.identifier,
          position: { x: touch.clientX, y: touch.clientY },
          speed: 0
        };
      });

      setTouchPoints(newTouchPoints);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchPoints]);

  React.useEffect(() => {
    if (touchPoints === null) return;
    const [touchPoint1, touchPoint2] = touchPoints || [];
    const speed1 = touchPoint1 ? touchPoint1.speed : 0;
    const speed2 = touchPoint2 ? touchPoint2.speed : 0;
    const minSpeed = Math.min(speed1, speed2);
    const maxSpeed = Math.max(speed1, speed2);

    if (minSpeed > threshold) {
      setGestureType('RST-style');
    } else if (minSpeed < threshold && maxSpeed > threshold) {
      setGestureType('pin-panning');
    } else {
      setGestureType('');
    }
  }, [touchPoints, threshold]);

  return gestureType;
};

export default useGesture;
