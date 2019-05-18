import { actionTypes } from '../Actions/actionTypes';

import {
  sessionStateIdle,
  sessionStateRecording,
  sessionStatePlaying,
} from '../keys';

const defaultState = {
  files: [],
  recordingState: sessionStateIdle
}

export const sessionRecording = (state = defaultState, action) => { // state refers to version
  switch (action.type) {
    case actionTypes.updateSessionRecording:
      return {
        recordingState: action.payload.state,
        files: action.payload.files
      }
    default:
      return state;
  }
};
