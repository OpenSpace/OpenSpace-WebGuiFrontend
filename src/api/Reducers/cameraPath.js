import actionTypes from '../Actions/actionTypes';

const defaultState = {
  target: undefined,
  remainingTime: undefined,
  isPaused: undefined
};

const cameraPath = (state = defaultState, action = {}) => {
  const newState = { ...state };
  switch (action.type) {
    case actionTypes.updateCameraPath:
      newState.target = action.payload.target;
      newState.remainingTime = action.payload.remainingTime;
      newState.isPaused = action.payload.isPaused;
      return newState;
    case actionTypes.subscribeToCameraPath:
      newState.data = action.payload;
      return newState;
    default:
      return state;
  }
};
export default cameraPath;
