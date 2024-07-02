import {
  updateCustomGroupOrdering
} from '../Actions';
import actionTypes from '../Actions/actionTypes';

const getGuiGroupsOrdering = async (luaApi, callback) => {
  const object = await luaApi.guiGroupsOrdering();
  const orderingMap = object[1];
  if (!orderingMap) {
    return;
  }
  callback(orderingMap);
};

const groups = (store) => (next) => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.initializeLuaApi:
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
