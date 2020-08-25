import { actionTypes } from '../Actions/actionTypes';

/**
 * Make sure the date string contains a time zone
 * @param date
 * @param zone - the time zone in ISO 8601 format
 * @constructor
 */
const dateStringWithTimeZone = (date, zone = 'Z') =>
  (!date.includes('Z') ? `${date}${zone}` : date);


const defaultState = {
  time: undefined,
  targetDeltaTime: undefined,
  deltaTime: undefined,
  isPaused: undefined,
  hasNextStep: undefined,
  hasPrevStep: undefined,
  nextStep: undefined,
  prevStep: undefined
};

export const time = (state = defaultState, action = {}) => {
  switch (action.type) {
    case actionTypes.updateTime:
      const time = action.payload.time;
      const deltaTime = action.payload.deltaTime;
      const targetDeltaTime = action.payload.targetDeltaTime;
      const isPaused = action.payload.isPaused;
      const hasNextStep = action.payload.hasNextStep;
      const hasPrevStep = action.payload.hasPrevStep;
      const nextStep = action.payload.nextStep;
      const prevStep = action.payload.prevStep;
      const newState = {...state};

      if (time !== undefined) {
        newState.time = new Date(dateStringWithTimeZone(time));
      }
      if (deltaTime !== undefined) {
        newState.deltaTime = deltaTime;
      }
      if (targetDeltaTime !== undefined) {
        newState.targetDeltaTime = targetDeltaTime;
      }
      if (isPaused !== undefined) {
        newState.isPaused = isPaused;
      }
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
