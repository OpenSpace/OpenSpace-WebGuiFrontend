// TouchTypes.ts

export type InputState = {
  values: {
    zoomIn?: number;
    zoomOut?: number;
    orbitX?: number;
    orbitY?: number;
    panX?: number;
    panY?: number;
    localRollX?: number;
    localRollY?: number;
    globalRollX?: number;
    globalRollY?: number;
  };
};

export type Payload = {
  type: string;
  inputState: InputState;
};
