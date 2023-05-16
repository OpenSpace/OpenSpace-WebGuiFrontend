import { actionTypes } from '../Actions/actionTypes';

const defaultState = {
  latitude: undefined,
  longitude: undefined,
  altitude: undefined,
  altitudeUnit: undefined
};

export const camera = (state = defaultState, action) => {
  const newState = { ...state };
  switch (action.type) {
  case actionTypes.updateCamera:
    newState.altitude = action.payload.altitude;
    newState.latitude = action.payload.latitude;
    newState.longitude = action.payload.longitude;
    newState.altitudeUnit = action.payload.altitudeUnit;
    return newState;
  case actionTypes.subscribeToCamera:
    newState.data = action.payload;
    return newState;
  default:
    return state;
  }

  return state;
};
