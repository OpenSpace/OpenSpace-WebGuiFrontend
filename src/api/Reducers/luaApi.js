import actionTypes from '../Actions/actionTypes';

const defaultState = undefined;

const luaApi = (state = defaultState, action = {}) => { // state refers to luaApi
  switch (action.type) {
    case actionTypes.initializeLuaApi:
      return action.payload;
    default:
      return state;
  }
};
export default luaApi;
