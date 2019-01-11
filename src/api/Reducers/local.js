import { actionTypes } from '../Actions/actionTypes';

const defaultFocusState = {
  reAim: false
};

const defaultState = {
  focus: defaultFocusState
};

const focus = (state = defaultState, action) => { // state refers to local
  switch (action.type) {
    case actionTypes.setReAim:
      return {
        reAim: action.payload,
      }
    default:
      return state;
  }
};

export const local = (state = defaultState, action) => { // state refers to local
  switch (action.type) {
    case actionTypes.setReAim:
      return {
          ...state,
          focus: focus(state, action)
        };
    default:
      return state;
  }
};
