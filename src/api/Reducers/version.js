import actionTypes from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  data: {}
};

const version = (state = defaultState, action) => { // state refers to version
  switch (action.type) {
  case actionTypes.initializeVersion:
    return {
      isInitialized: true,
      data: { ...action.payload }
    };
  default:
    return state;
  }
};
export default version;
