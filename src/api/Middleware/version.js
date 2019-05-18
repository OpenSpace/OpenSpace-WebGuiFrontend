import {
  initializeVersion,
} from '../Actions';

import { actionTypes } from '../Actions/actionTypes';

const getVersion = callback => {
  /*DataManager.getVersion((data) => {
    callback(data);
  })*/
};

export const version = store => next => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.onOpenConnection:
      getVersion((data) => {
        store.dispatch(initializeVersion(data));
      });
      break;
    default:
      break;
  }
  return result;
};
