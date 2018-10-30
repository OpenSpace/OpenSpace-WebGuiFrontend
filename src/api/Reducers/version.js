import DataManager from '../DataManager';
import { actionTypes } from '../Actions/actionTypes';

export const version = (state = {}, action) => { // state refers to version
  switch (action.type) {
    case actionTypes.initializeVersion:
      return {
        isInitialized: true,
        data: {...action.payload}
      }
    default:
      return {
        isInitialized: false,
        data: {}
      }
  }
};
