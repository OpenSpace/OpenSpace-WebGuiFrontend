import actionTypes from '../Actions/actionTypes';
import { applyPatch } from 'fast-json-patch';

const defaultState = {
  isInitialized: false,
  url: undefined, // Urls for the image collection
  imageList: undefined, // Contains all the image data
  imageMap: undefined, // Maps the index to the url with a map
  cameraInSolarSystem: undefined
};

const skybrowser = (state = defaultState, action = {}) => {
  const newState = { ...state };
  switch (action.type) {
    case actionTypes.updateSkyBrowser:
      newState.cameraInSolarSystem = action.payload.cameraInSolarSystem;
      return newState;
    case actionTypes.initializeSkyBrowser:
      newState.isInitialized = true;
      newState.imageList = action.payload.imageList;
      newState.imageList.sort((a, b) => a.key - b.key);
      newState.imageMap = {};
      newState.imageList.forEach((img) => {
        newState.imageMap[img.url] = img.identifier;
      });
      newState.url = action.payload.url;
      return newState;
    default:
      return state;
  }
};
export default skybrowser;
