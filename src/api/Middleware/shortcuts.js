import { addActions, initializeShortcuts } from '../Actions';
import actionTypes from '../Actions/actionTypes';
import api from '../api';

let topic;

function subscribeToShortcuts(store) {
  topic = api.startTopic('shortcuts', {
    event: 'start_subscription'
  });
  (async () => {
    // eslint-disable-next-line no-restricted-syntax
    for await (const data of topic.iterator()) {
      // When a new action has been added, the topic
      // sends it as one action in an array
      if (data.shortcuts.length === 1) {
        store.dispatch(addActions(data.shortcuts));
      } else {
        store.dispatch(initializeShortcuts(data.shortcuts));
      }
    }
  })();
}

function unsubscribeToShortcuts() {
  if (!topic) {
    return;
  }
  topic.talk({
    event: 'stop_subscription'
  });
  topic.cancel();
}

async function getAction(uri) {
  if (!topic) {
    return;
  }
  topic.talk({
    event: 'get_action',
    identifier: uri
  });
}

const shortcuts = (store) => (next) => (action) => {
  const result = next(action);
  switch (action.type) {
    case actionTypes.onOpenConnection:
      subscribeToShortcuts(store);
      break;
    case actionTypes.onCloseConnection:
      unsubscribeToShortcuts();
      break;
    case actionTypes.triggerAction: {
      const actionName = action.payload;
      store.getState().luaApi.action.triggerAction(actionName);
      break;
    }
    case actionTypes.getAction:
      getAction(action.payload.uri);
      break;
    default:
      break;
  }
  return result;
};
export default shortcuts;
