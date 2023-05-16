// To log everything:
import { actionTypes } from '../Actions/actionTypes';

const actionFilter = { ...actionTypes };

// To log everything except time:
// delete actionFilter.updateTime;

const logger = (store) => (next) => (action) => {
  const matchesFilter = (Object.values(actionFilter).indexOf(action.type) !== -1);

  if (matchesFilter) {
    console.group(action.type);
    console.info('dispatching', action);
  }
  const result = next(action);
  if (matchesFilter) {
    console.log('next state', store.getState());
    console.groupEnd(action.type);
  }
  return result;
};

export default logger;
