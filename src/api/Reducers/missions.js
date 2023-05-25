import actionTypes from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  data: {}
};

const missions = (state = defaultState, action) => {
  switch (action.type) {
  case actionTypes.initializeMissions:
    return {
      isInitialized: true,
      data: { ...action.payload }
    };
  default:
    return state;
  }
};
export default missions;
