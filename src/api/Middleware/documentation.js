import {
  initializeDocumentation
} from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';

const getDocumentation = async (callback) => {
  const documentation = await api.getDocumentation('meta');
  callback(documentation);
};

const documentation = (store) => (next) => (action) => {
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
export default documentation;
