import DataManager from '../DataManager';
import { actionTypes } from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  data: []
}

export const shortcuts = (state = defaultState, action) => { // state refers to version
  switch (action.type) {
    case actionTypes.initializeShortcuts:
      return {
        isInitialized: true,
        data: {...action.payload}
      }
    default:
      return state;
  }
};
