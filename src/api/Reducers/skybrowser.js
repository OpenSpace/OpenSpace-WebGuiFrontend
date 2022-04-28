import { actionTypes } from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  data: {},
  imageList: [],
  selectedBrowserId: "",
  cameraIsInSolarSystem: true,
  targets: {}
};

export const skybrowser = (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.initializeSkyBrowser:
      return {
        isInitialized: true,
        imageList: action.payload,
      };
    case actionTypes.subscribeToSkyBrowser:
      return {
        data: action.payload,
      };
    case actionTypes.updateSkyBrowser:
      const newState = {...state};
      newState.selectedBrowserId = action.payload.selectedBrowserId;
      newState.cameraInSolarSystem = action.payload.cameraInSolarSystem;
      newState.browsers = action.payload.browsers;
      return newState;
    default:
      return state;
  }

  return state;
};
