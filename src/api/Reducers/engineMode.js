import actionTypes from '../Actions/actionTypes';
import { EngineModeUserControl } from '../keys';

const defaultState = {
  mode: EngineModeUserControl
};

const engineMode = (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.updateEngineMode:
      return {
        mode: action.payload.mode
      };
    default:
      return state;
  }
};
export default engineMode;
