import { actionTypes } from '../Actions/actionTypes';

/**
 * Make sure the date string contains a time zone
 * @param date
 * @param zone - the time zone in ISO 8601 format
 * @constructor
 */
// Using this hack to parse times https://scholarslab.lib.virginia.edu/blog/parsing-bc-dates-with-javascript/
const dateStringWithTimeZone = (date, zone = 'Z') => {
  // Ensure we don't have white spaces
  const whitespaceRemoved = date.replace(/\s/g, '');
  let result;
  // If we are in negative years (before year 0)
  if (whitespaceRemoved[0] === '-') {
    // Remove first dash so we can split it where the year ends
    const unsignedDate = whitespaceRemoved.substring(1);
    // Get the year by searching for first -
    const unsignedYear = unsignedDate.substring(0 , unsignedDate.indexOf('-'));
    // Create year for the pattern -00YYYY for negative years (see link above)
    const filledYear = `-${unsignedYear.padStart(6, "0")}`;
    // Get everything after the year
    const rest = unsignedDate.substring(unsignedDate.indexOf('-'));
    // Add new filled year together with the rest
    result = `${filledYear}${rest}`;
  }
  else { // After year 0
    // Ensure year always has 4 digits - fill with 0 in front
    const year = whitespaceRemoved.substring(0, whitespaceRemoved.indexOf('-'));
    const rest = whitespaceRemoved.substring(whitespaceRemoved.indexOf('-'));
    const filledYear = year.padStart(4, '0');
    result = `${filledYear}${rest}`;
  }
 
  return !result.includes('Z') ? `${result}${zone}` : result;
}


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
        let date = new Date(dateStringWithTimeZone(time));
        // Make the GUI only update with each in game second
        date.setMilliseconds(0);
        // Only update the state every second for performance
        if (!state.time) {
          newState.time = date;
        }
        if (Math.abs(state.time?.getTime() - date?.getTime()) > 1000) {
          newState.time = date;
        }
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
