import actionTypes from '../Actions/actionTypes';
import { applyPatch } from 'fast-json-patch';

const defaultState = {
  isInitialized: false,
};

const skybrowser = (state = defaultState, action = {}) => {
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
      // Data changes are sent as an array with operations
      // These operations are standard json patch types
      // https://json.nlohmann.me/api/basic_json/patch/
      // These can be these three types: "replace", "add", and "remove"
      return applyPatch(newState, action.payload).newDocument;
    default:
      return state;
  }
};
export default skybrowser;
