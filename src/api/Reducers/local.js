import { actionTypes } from '../Actions/actionTypes';

const defaultState = {
  navigationAction: 'Focus'
};

const navigationAction = (state = defaultState, action) => { // state refers to local
  switch (action.type) {
    case actionTypes.setNavigationAction:
      return action.payload;
    default:
      return state;
  }
};

export const local = (state = defaultState, action) => { // state refers to local
  switch (action.type) {
    case actionTypes.setNavigationAction:
      return {
          ...state,
          navigationAction: navigationAction(state, action)
        };
    default:
      return state;
  }
};
