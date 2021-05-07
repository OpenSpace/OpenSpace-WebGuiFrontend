import { actionTypes } from '../Actions/actionTypes';

const defaultState = {
  isInitialized: false,
  data: [],
  showTimeline: true,
}

export const missions = (state = defaultState, action) => { // state refers to version
  switch (action.type) {
    case actionTypes.initializeMissions:
      return {
        ...state,
        isInitialized: true,
        data: action.payload,
      }
    case actionTypes.setEventTimelineVisibility:
      return {
        ...state,
        showTimeline: action.payload,
      }
    default:
      return state;
  }
};
