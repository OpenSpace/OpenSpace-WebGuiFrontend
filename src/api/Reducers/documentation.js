import { actionTypes } from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  data: {},
};

export const documentation = (state = defaultState, action) => { // state refers to docu
  switch (action.type) {
    case actionTypes.initializeDocumentation:
      return {
        isInitialized: true,
        data: { ...action.payload },
      };
    default:
      return state;
  }
};
