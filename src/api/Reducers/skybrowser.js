import { actionTypes } from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  data: {},
  imageList: [],
  selectedBrowserId: '',
  cameraIsInSolarSystem: true,
  targets: {},
  url: '',
};

export const skybrowser = (state = defaultState, action) => {
  const newState = { ...state };
  switch (action.type) {
    case actionTypes.initializeSkyBrowser:
      newState.isInitialized = true;
      newState.imageList = action.payload.imageList;
      newState.url = action.payload.url;
      return newState;
    case actionTypes.subscribeToSkyBrowser:
      newState.data = action.payload;
      return newState;
    case actionTypes.updateSkyBrowser:
      newState.selectedBrowserId = action.payload.selectedBrowserId;
      newState.cameraInSolarSystem = action.payload.cameraInSolarSystem;
      newState.browsers = action.payload.browsers;
      return newState;
    default:
      return state;
  }

  return state;
};
