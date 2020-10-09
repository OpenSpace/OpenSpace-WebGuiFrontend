import {
  initializeDocumentation,
} from '../Actions';

import api from '../api';

import { actionTypes } from '../Actions/actionTypes';

const getDocumentation = async callback => {
  var documentation = await api.getDocumentation("meta");
  callback(documentation);
};

export const documentation = store => next => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.onOpenConnection:
      getDocumentation((data) => {
        store.dispatch(initializeDocumentation(data));
      });
      break;
    default:
      break;
  }
  return result;
};
