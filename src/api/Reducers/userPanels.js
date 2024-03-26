import actionTypes from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  panels: {}
};

const userPanels = (state = defaultState, action = {}) => {
  switch (action.type) {
    case actionTypes.initializeUserPanels:
      return {
        isInitialized: true,
        panels: action.payload
      };
    default:
      return state;
  }
};
export default userPanels;
