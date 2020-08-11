import { actionTypes } from '../Actions/actionTypes';

const defaultState = {
  hasNextDeltaTimeStep: undefined,
  hasPrevDeltaTimeStep: undefined,
};

// TODO: this is where I should change how the data I send from the topic should be converted to states in the store
export const deltaTimes = (state = defaultState, action = {}) => {
  switch (action.type) {
    case actionTypes.updateDeltaTimes:
      const hasNextStep = action.payload.hasNextStep;
      const hasPrevStep = action.payload.hasPrevStep;
      const newState = {...state};

      if (hasNextStep !== undefined) {
        newState.hasNextDeltaTimeStep = hasNextStep;
      }
      if (hasPrevStep !== undefined) {
        newState.hasPrevDeltaTimeStep = hasPrevStep;
      }
      return newState;
  }

  return state;
};
