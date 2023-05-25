import actionTypes from '../Actions/actionTypes';

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
    const unsignedYear = unsignedDate.substring(0, unsignedDate.indexOf('-'));
    // Create year for the pattern -00YYYY for negative years (see link above)
    const filledYear = `-${unsignedYear.padStart(6, '0')}`;
    // Get everything after the year
    const rest = unsignedDate.substring(unsignedDate.indexOf('-'));
    // Add new filled year together with the rest
    result = `${filledYear}${rest}`;
  } else { // After year 0
    // Ensure year always has 4 digits - fill with 0 in front
    const year = whitespaceRemoved.substring(0, whitespaceRemoved.indexOf('-'));
    const rest = whitespaceRemoved.substring(whitespaceRemoved.indexOf('-'));
    const filledYear = year.padStart(4, '0');
    result = `${filledYear}${rest}`;
  }

  return !result.includes('Z') ? `${result}${zone}` : result;
};

const defaultState = {
  time: undefined,
  timeCapped: undefined,
  targetDeltaTime: undefined,
  deltaTime: undefined,
  isPaused: undefined,
  hasNextStep: undefined,
  hasPrevStep: undefined,
  nextStep: undefined,
  prevStep: undefined,
  deltaTimeSteps: undefined
};

const time = (state = defaultState, action = {}) => {
  switch (action.type) {
    case actionTypes.updateTime: {
      const { time } = action.payload;
      const { deltaTime } = action.payload;
      const { targetDeltaTime } = action.payload;
      const { isPaused } = action.payload;
      const { hasNextStep } = action.payload;
      const { hasPrevStep } = action.payload;
      const { nextStep } = action.payload;
      const { prevStep } = action.payload;
      const { deltaTimeSteps } = action.payload;
      const newState = { ...state };

      if (time !== undefined) {
        newState.time = new Date(dateStringWithTimeZone(time));

        // Make optimized time that only updates every second
        const date = new Date(dateStringWithTimeZone(time));
        date.setMilliseconds(0);
        // If it is the first time the time is sent, just set the state
        // Else cap the update of the state to every second for performance
        if (!state.timeCapped) {
          newState.timeCapped = date;
        } else if (date.toISOString() !== newState.timeCapped.toISOString()) {
          newState.timeCapped = date;
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
    default:
      return state;
  }
};
export default time;
