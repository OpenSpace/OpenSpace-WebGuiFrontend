import { initializeVersion } from '../Actions';
import { actionTypes } from '../Actions/actionTypes';
import DataManager from '../DataManager';

const getVersion = callback => {
  DataManager.getVersion((data) => {
    callback(data);
  })
};

export const version = store => next => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.getVersion:
      getVersion((data) => {
        store.dispatch(initializeVersion(data));
      });
      break;
    default:
      break;
  }
  return result;
};
