// TouchTypes.ts

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
