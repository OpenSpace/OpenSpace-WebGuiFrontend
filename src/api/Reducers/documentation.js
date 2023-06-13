import actionTypes from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  data: {}
};

const documentation = (state = defaultState, action = {}) => { // state refers to documentation
  switch (action.type) {
    case actionTypes.initializeDocumentation:
      return {
        isInitialized: true,
        data: [...action.payload]
      };
    default:
      return state;
  }
};
export default documentation;
