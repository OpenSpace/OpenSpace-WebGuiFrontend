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
  prevStep: undefined,
  deltaTimeSteps: undefined
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
      const deltaTimeSteps = action.payload.deltaTimeSteps;
      const newState = {...state};

      if (time !== undefined) { 
        // The date constructor only accepts a small array of the different types that we
        // might encounter. In particular it doesn't work with any year ranges that don't
        // have exactly four digits.
        // So we parse the date string manually and call the correct function on the date
        // object instead
        let date = new Date(dateStringWithTimeZone(time));

        let wholeParts = time.split('T');
        console.assert(wholeParts.length === 2);

        //
        // Dealing with the year
        let dayParts = wholeParts[0].split('-');
        console.assert(dayParts.length === 3 || dayParts.length === 4);
        // If the length is 4, we have a leading - meaning that the date is negative
        if (dayParts.length === 4) {
          console.assert(dayParts[0].trim() === '');
          dayParts.shift();
          date.setFullYear(-parseInt(dayParts[0]));
        }
        else {
          date.setFullYear(parseInt(dayParts[0]));
        }

        newState.time = date;
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
      if (deltaTimeSteps !== undefined) {
        newState.deltaTimeSteps = deltaTimeSteps;
      }
      return newState;
  }

  return state;
};
