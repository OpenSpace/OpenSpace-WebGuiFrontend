import {
  getCustomGroupsOrdering,
  updateCustomGroupOrdering
} from '../Actions';
import actionTypes from '../Actions/actionTypes';

const getGuiGroupsOrdering = async (luaApi, callback) => {
  const object = await luaApi.guiTreeOrdering();
  const orderingMap = object[1];
  if (!orderingMap) {
    return;
  }
  // Use a callback since we need to wait for the value to be returned
  callback(orderingMap);
};

const groups = (store) => (next) => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.initializeLuaApi:
      store.dispatch(getCustomGroupsOrdering(action.payload));
      break;
    case actionTypes.getCustomGroupsOrdering:
      getGuiGroupsOrdering(action.payload, (data) => {
        store.dispatch(updateCustomGroupOrdering(data));
      });
      break;
    default:
      break;
  }
  return result;
};
export default groups;
