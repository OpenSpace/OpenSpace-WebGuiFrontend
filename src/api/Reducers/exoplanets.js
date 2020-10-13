import { actionTypes } from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  data: {}
}

export const exoplanets = (state = defaultState, action) => { // state refers to docu
  switch (action.type) {
    case actionTypes.initializeExoplanets:
      return {
        isInitialized: true,
        data: action.payload
      }
    default:
      return state;
  }
};
