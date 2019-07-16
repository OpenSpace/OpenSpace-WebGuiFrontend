import { actionTypes } from '../Actions/actionTypes';

const defaultState = undefined;

export const luaApi = (state = defaultState, action) => { // state refers to local
  switch (action.type) {
    case actionTypes.initializeLuaApi:
      return action.payload;
    default:
      return state;
  }
};
