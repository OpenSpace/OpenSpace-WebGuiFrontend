import actionTypes from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  data: {}
};

const exoplanets = (state = defaultState, action = {}) => {
  switch (action.type) {
    case actionTypes.initializeExoplanets:
      return {
        isInitialized: true,
        data: action.payload
      };
    default:
      return state;
  }
};
export default exoplanets;
