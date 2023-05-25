import actionTypes from '../Actions/actionTypes';
import { SessionStateIdle } from '../keys';

const defaultState = {
  files: [],
  recordingState: SessionStateIdle
};

const sessionRecording = (state = defaultState, action) => { // state refers to version
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
