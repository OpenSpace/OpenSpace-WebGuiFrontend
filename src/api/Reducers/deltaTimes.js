import { actionTypes } from '../Actions/actionTypes';

const defaultState = {
  hasNextDeltaTimeStep: undefined,
  hasPrevDeltaTimeStep: undefined,
  nextDeltaTimeStep: undefined,
  prevDeltaTimeStep: undefined
};

// TODO: this is where I should change how the data I send from the topic should be converted to states in the store
export const deltaTimes = (state = defaultState, action = {}) => {
  switch (action.type) {
    case actionTypes.updateDeltaTimes:
      const hasNextStep = action.payload.hasNextStep;
      const hasPrevStep = action.payload.hasPrevStep;
      const nextStep = action.payload.nextStep;
      const prevStep = action.payload.prevStep;
      const newState = {...state};

      if (hasNextStep !== undefined) {
        newState.hasNextDeltaTimeStep = hasNextStep;
      }
      if (hasPrevStep !== undefined) {
        newState.hasPrevDeltaTimeStep = hasPrevStep;
      }
      if (nextStep !== undefined) {
        newState.nextDeltaTimeStep = nextStep;
      }
      if (prevStep !== undefined) {
        newState.prevDeltaTimeStep = prevStep;
      }
      return newState;
  }

  return state;
};
