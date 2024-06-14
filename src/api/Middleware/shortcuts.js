import { addActions, initializeShortcuts } from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';

let topic;

async function getAllShortcuts(store) {
  topic = api.startTopic('shortcuts', {
    event: 'get_all_shortcuts'
  });
  const { value } = await topic.iterator().next();
  store.dispatch(initializeShortcuts(value.shortcuts));
  topic.cancel();
}

async function getShortcut(store, uri) {
  topic = api.startTopic('shortcuts', {
    event: 'get_shortcut',
    identifier: uri
  });
  const { value } = await topic.iterator().next();
  store.dispatch(addActions(value.shortcuts));
  topic.cancel();
}

const shortcuts = (store) => (next) => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.onOpenConnection:
      getAllShortcuts(store);
      break;
    case actionTypes.triggerAction: {
      const actionName = action.payload;
      store.getState().luaApi.action.triggerAction(actionName);
      break;
    }
    case actionTypes.getAction:
      getShortcut(store, action.payload.uri);
      break;
    default:
      break;
  }
  return result;
};
export default shortcuts;
