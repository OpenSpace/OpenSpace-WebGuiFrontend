import {
  getCustomGroupsOrdering,
  updateCustomGroupOrdering
} from '../Actions';
import actionTypes from '../Actions/actionTypes';

const getGuiGroupsOrdering = async (luaApi, dispatch) => {
  await luaApi.guiOrder()
    // eslint-disable-next-line no-console
    .catch((e) => console.log(e))
    .then((data) => {
      const orderingMap = data[1];
      if (!orderingMap) {
        console.error('Error retrieving GUI tree ordering');
      }
      dispatch(updateCustomGroupOrdering(orderingMap));
    });
};

const groups = (store) => (next) => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.initializeLuaApi:
      store.dispatch(getCustomGroupsOrdering());
      break;
    case actionTypes.getCustomGroupsOrdering:
      getGuiGroupsOrdering(store.getState().luaApi, store.dispatch);
      break;
    default:
      break;
  }
  return result;
};
export default groups;
