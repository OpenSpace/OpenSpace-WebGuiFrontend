import { actionTypes } from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  data: {},
};

export const skybrowser = (state = defaultState, action) => { // state refers to docu
  switch (action.type) {
    case actionTypes.initializeSkyBrowser:
      return {
        isInitialized: true,
        data: action.payload,
      };
    default:
      return state;
  }
};
