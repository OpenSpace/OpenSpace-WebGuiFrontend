import { actionTypes } from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  navigationPath: '/',
  data: []
}

export const shortcuts = (state = defaultState, action) => { // state refers to version
  switch (action.type) {
    case actionTypes.initializeShortcuts:
      return {
        isInitialized: true,
        data: {...action.payload},
        navigationPath: '/',
      }
    case actionTypes.setActionsPath:
      return {
        isInitialized: state.isInitialized,
        data: state.data,
        navigationPath: action.payload
      }
    default:
      return state;
  }
};
