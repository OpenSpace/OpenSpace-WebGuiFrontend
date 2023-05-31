import actionTypes from '../Actions/actionTypes';
import { SessionStateIdle } from '../keys';

const defaultState = {
  files: [],
  recordingState: SessionStateIdle
};

// state refers to sessionRecording
const sessionRecording = (state = defaultState, action = {}) => {
  switch (action.type) {
    case actionTypes.updateSessionRecording:
      return {
        recordingState: action.payload.state,
        files: action.payload.files
      };
    default:
      return state;
  }
};
export default sessionRecording;
