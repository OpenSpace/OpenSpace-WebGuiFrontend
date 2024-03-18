import React from 'react';

import styles from './TouchWrapper.scss';
import TouchFrame from '../TouchFrame/TouchFrame';
import useTouchInteraction from '../TouchFrame/useTouchInteraction';
import { TouchState } from '../TouchFrame/touchTypes';

interface TouchWrapperProps {
  children: React.ReactNode;
}

export type InputState = {
  values: {
    zoomIn?: number;
    orbitX?: number;
    orbitY?: number;
    panX?: number;
    panY?: number;
    localRollX?: number;
  };
};

export type Payload = {
  type: string;
  inputState: InputState;
};

export default function TouchWrapper({ children }: TouchWrapperProps) {
  const { touchStartX, touchStartY } = useTouchInteraction();

  return (
    <div
      className={styles.wrapper}
      // onPointerDown={mouseDown}
      // onPointerUp={mouseUp}
      // onPointerCancel={mouseUp}
      // onPointerLeave={mouseUp}
      // onLostPointerCapture={mouseUp}
      // onPointerMove={mouseMove}
      // onTouchStart={touchDown}
      // onTouchEnd={touchUp}
      // onTouchCancel={touchUp}
      // onTouchMove={touchMove}
    >
      <TouchFrame />
      {/** OpenSpace video stream */}
      <div></div>

      {/* Content */}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
